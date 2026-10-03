# Pilot and Production Gates

Status: Active launch criteria

MISSION-043 and MISSION-044 are operational gates. They are not completed by adding code, schema, or documentation alone.

## MISSION-043 Pilot gate

Pilot may begin only when all of the following are evidenced:

- API and worker build cleanly from `main`.
- Frontend visual regression review passes against the approved reference shell.
- PostgreSQL migrations apply from zero and from the previous supported schema state.
- Tenant-isolation tests cover organization-scoped reads and writes.
- Artist Identity, Representation, Authority, Protection, and Authorization state transitions have test coverage for allowed and denied paths.
- Catalog creation, asset handling, metadata, rights declaration, submission, QC, provider delivery, update/takedown, and transfer flows have end-to-end evidence.
- A verified distribution provider contract and sandbox/staging integration exist. No invented capability is accepted as evidence.
- Statement ingestion, royalty normalization, reconciliation, ledger posting, wallet projection, compliance hold, and payout eligibility have test evidence.
- Payment/payout provider country and currency support is verified against the actual provider contract.
- Webhook signature validation, replay protection, idempotency, and reconciliation are exercised.
- Backup restore evidence exists for the pilot environment.
- Audit logs and operational telemetry are queryable.
- Incident runbook ownership and escalation paths are assigned.
- Pilot organizations, limits, allowed destinations, payout limits, and rollback criteria are explicitly configured.

## Pilot constraints

Pilot must use a deliberately limited cohort. Pilot configuration must define maximum active organizations, maximum releases per organization, supported destinations, allowed territories, payout limits, manual review requirements, and emergency disable switches.

No pilot participant receives broader authority than their verified organization, representation, rights, or authorization permits.

## MISSION-044 Production gate

Production may begin only after pilot evidence demonstrates stable operation and all pilot exit criteria pass.

Required production evidence:

- No unresolved severity-1 or severity-2 defects.
- No unresolved tenant-isolation defect.
- No unresolved financial imbalance or unexplained reconciliation variance.
- Provider error/retry behavior is measured under representative load.
- Payout execution and reconciliation are proven end to end.
- KYC/KYB and compliance procedures are approved for enabled countries.
- Backup restore and disaster-recovery objectives are tested and recorded.
- Capacity assumptions and alert thresholds are based on observed pilot metrics.
- Security review covers secrets, authentication, authorization, webhooks, uploads, provider credentials, PII, and financial data.
- Data-retention and deletion procedures are documented and tested where applicable.
- Support and backoffice procedures are operational.
- Production DNS, TLS, Hostinger runtime, database connectivity, storage, monitoring, and deployment credentials are verified.

## Rollback

A deployment must be reversible without creating another Git branch. Rollback uses a known-good artifact or `git revert` on `main`, plus forward-only database remediation when a migration cannot be safely reversed.

## Decision record

Every pilot/production approval records date, approver, commit SHA, migration version, provider configuration version, unresolved accepted risks, and rollback target.
