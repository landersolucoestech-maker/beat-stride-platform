# MISSION-043 and MISSION-044 — Pilot and Production

Status: Gates Defined, Not Yet Passed

## MISSION-043 Pilot

The repository now defines the pilot gate and the evidence required to enter it. Pilot is not considered complete until a limited real cohort exercises the real provider, database, operational, financial, security, support, recovery, and observability paths under controlled limits.

## MISSION-044 Production

Production remains blocked until pilot exit criteria pass and all production dependencies are verified. Production approval must reference the exact `main` commit, migration version, provider configuration, Hostinger deployment target, accepted residual risks, and rollback target.

## Non-code dependencies

The remaining launch blockers are tracked in `docs/operations/EXTERNAL_BLOCKERS.md`. Repository work may prepare adapters, contracts, tests, runbooks, and deployment automation, but must not fabricate provider credentials, legal approval, KYC/KYB requirements, payment capabilities, or Lander Creators API contracts.

## Branch policy

Pilot and production promotion remain on `main`. No release branch is introduced. Known-good artifacts and `git revert` provide application rollback; database remediation is forward-only when destructive reversal would be unsafe.
