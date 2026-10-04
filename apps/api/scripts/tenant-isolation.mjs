import { randomUUID } from "node:crypto";

import pg from "pg";

const { Pool } = pg;
const baseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:3100/api/v1";
const databaseUrl = process.env.DATABASE_URL;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { response, body };
}

async function register(email, displayName) {
  const { response, body } = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: "TestOnly!StrongPassword-2026",
      organizationType: "COMPANY",
      organizationDisplayName: displayName,
      organizationLegalName: `${displayName} Legal`,
      companySubtype: "LABEL",
    }),
  });
  assert(response.status === 201, `registration failed for ${email}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}

function organizationHeaders(account, organizationId = account.organization.id) {
  return {
    Authorization: `Bearer ${account.token}`,
    "X-Organization-Id": organizationId,
  };
}

const accountA = await register("tenant-a@example.test", "Tenant A");
const accountB = await register("tenant-b@example.test", "Tenant B");

const createArtist = await request("/artist-identities", {
  method: "POST",
  headers: organizationHeaders(accountA),
  body: JSON.stringify({ canonicalName: "Tenant A Artist", kind: "PERSON" }),
});
assert(createArtist.response.status === 201, `artist creation failed: ${createArtist.response.status} ${JSON.stringify(createArtist.body)}`);

const ownArtists = await request("/artist-identities", {
  headers: organizationHeaders(accountA),
});
assert(ownArtists.response.status === 200, `tenant A artist list failed: ${ownArtists.response.status}`);
assert(Array.isArray(ownArtists.body?.items) && ownArtists.body.items.length === 1, "tenant A should see exactly its created artist");

const crossTenantRead = await request("/artist-identities", {
  headers: organizationHeaders(accountB, accountA.organization.id),
});
assert(crossTenantRead.response.status === 403, `cross-tenant organization access must be forbidden, got ${crossTenantRead.response.status}`);

const tenantBOwnRead = await request("/artist-identities", {
  headers: organizationHeaders(accountB),
});
assert(tenantBOwnRead.response.status === 200, `tenant B own artist list failed: ${tenantBOwnRead.response.status}`);
assert(Array.isArray(tenantBOwnRead.body?.items) && tenantBOwnRead.body.items.length === 0, "tenant B must not see tenant A artist data");

const systemAccess = await request("/backoffice/operations/work-items", {
  headers: { Authorization: `Bearer ${accountA.token}` },
});
assert(systemAccess.response.status === 403, `customer organization owner must not inherit system permissions, got ${systemAccess.response.status}`);

const createRelease = await request("/catalog/releases", {
  method: "POST",
  headers: organizationHeaders(accountA),
  body: JSON.stringify({
    title: "Tenant A Release",
    type: "SINGLE",
    primaryArtistIdentityId: createArtist.body.id,
    releaseDate: "2026-12-01",
    primaryGenre: "Pop",
    explicit: false,
    tracks: [{ title: "Tenant A Track", explicit: false }],
    provisionalSplits: [{ name: "Tenant A Artist", role: "PRIMARY_ARTIST", percentage: 100 }],
    pendingAssets: { artwork: null, tracks: [] },
  }),
});
assert(createRelease.response.status === 201, `release creation failed: ${createRelease.response.status} ${JSON.stringify(createRelease.body)}`);

const tenantBReleases = await request("/catalog/releases", {
  headers: organizationHeaders(accountB),
});
assert(tenantBReleases.response.status === 200, `tenant B catalog read failed: ${tenantBReleases.response.status}`);
assert(Array.isArray(tenantBReleases.body?.items) && tenantBReleases.body.items.length === 0, "tenant B must not see tenant A releases");

assert(databaseUrl, "DATABASE_URL is required for launch-gate integration checks");
const pool = new Pool({ connectionString: databaseUrl });
try {
  await pool.query(
    `INSERT INTO user_system_roles (user_id, role_id, assigned_at, assigned_by_user_id)
     VALUES ($1, '00000000-0000-4000-8000-000000000035', NOW(), $1)
     ON CONFLICT DO NOTHING`,
    [accountA.user.id],
  );
} finally {
  await pool.end();
}

const readiness = await request("/backoffice/launch-readiness/gates/PRODUCTION_READINESS", {
  headers: { Authorization: `Bearer ${accountA.token}` },
});
assert(readiness.response.status === 200, `production-readiness gate read failed: ${readiness.response.status} ${JSON.stringify(readiness.body)}`);
assert(readiness.body?.ready === false, "production-readiness gate must fail closed before real evidence exists");
assert(readiness.body?.summary?.remaining > 0, "production-readiness gate must report unresolved requirements");

const prematurePilotApproval = await request("/backoffice/launch-readiness/decisions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accountA.token}`,
    "X-Correlation-Id": randomUUID(),
  },
  body: JSON.stringify({
    gate: "PILOT",
    decision: "APPROVED",
    commitSha: "0000000000000000000000000000000000000000",
    migrationVersion: "integration-test",
    acceptedRisks: [],
    rollbackTarget: "integration-test",
  }),
});
assert(prematurePilotApproval.response.status === 409, `pilot approval must be rejected before evidence is complete, got ${prematurePilotApproval.response.status}`);

const prematureCutover = await request("/backoffice/production-cutovers", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accountA.token}`,
    "X-Correlation-Id": randomUUID(),
  },
  body: JSON.stringify({
    launchDecisionId: randomUUID(),
    configurationVersion: "integration-test",
  }),
});
assert(prematureCutover.response.status === 409, `production cutover must reject an unapproved launch decision, got ${prematureCutover.response.status}`);
assert(prematureCutover.body?.code === "PRODUCTION_APPROVAL_REQUIRED", `unexpected cutover rejection: ${JSON.stringify(prematureCutover.body)}`);

console.log("Tenant isolation, permission boundaries, fail-closed launch gates, and cutover controls passed.");