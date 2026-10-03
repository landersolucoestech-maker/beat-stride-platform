# MISSION-003 — Authentication + Organizations + Tenancy

Status: In Progress

## Product rules
- The Distribution product has two customer types only: Independent Artist and Company/Organization.
- Company subtype is contextual metadata, not a separate product architecture.
- User, Organization, Artist Identity, Beneficiary, and Integration are distinct concepts.
- Authentication proves user identity. Membership establishes product organization access. Neither grants artist authority.
- Tenant isolation is enforced server-side and never trusted to frontend filtering.
- Final RBAC/ABAC policy remains intentionally deferred to MISSION-037 and MISSION-038; this mission establishes the minimum membership boundary required for tenancy.

## Implemented foundation
- Framework-independent Organization and Membership domain models.
- Independent Artist versus Company classification invariants.
- Organization creation with an atomic active owner membership.
- Organization-context resolution requires an active membership and active organization.
- ActorContext primitive for user/service/system actors.
- PostgreSQL foundation migration for users, organizations, memberships, audit events, outbox events, and idempotency keys.

## Remaining before mission closure
- Select and integrate the production authentication mechanism without leaking credentials into frontend or logs.
- Implement PostgreSQL repositories and transaction adapter.
- Add authenticated HTTP contracts for organization bootstrap and organization switching.
- Add tenant-isolation integration tests including direct UUID tampering attempts.
- Add audit/outbox records for organization lifecycle changes.
- Wire real frontend session and organization context while preserving the current visual shell.
