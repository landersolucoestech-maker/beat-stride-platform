import { describe, expect, it } from "vitest";

import { evaluatePermission } from "../../packages/auth/src/PermissionPolicy";

describe("PermissionPolicy", () => {
  const granted = new Set(["release.submit", "protection.request"]);

  it("requires both permission and domain authority", () => {
    expect(evaluatePermission({
      permissionKey: "release.submit",
      grantedPermissionKeys: granted,
      organizationMatches: true,
      resourceScopeMatches: true,
      domainAuthoritySatisfied: false,
      policySatisfied: true,
    })).toEqual({ allowed: false, reason: "DOMAIN_AUTHORITY_REQUIRED" });
  });

  it("allows only when every authorization dimension is satisfied", () => {
    expect(evaluatePermission({
      permissionKey: "release.submit",
      grantedPermissionKeys: granted,
      organizationMatches: true,
      resourceScopeMatches: true,
      domainAuthoritySatisfied: true,
      policySatisfied: true,
    })).toEqual({ allowed: true });
  });
});
