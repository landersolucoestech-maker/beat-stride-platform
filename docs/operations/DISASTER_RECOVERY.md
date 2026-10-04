# Disaster Recovery

## Scope

Disaster recovery covers PostgreSQL data, application configuration, release artifacts, operational evidence, and the ability to rebuild API and worker runtimes from the single `main` branch.

GitHub Pages is only a frontend preview and is not a production recovery target. Production hosting is planned for Hostinger.

## Required production decisions before pilot

The production environment must define and approve:

- recovery point objective (RPO);
- recovery time objective (RTO);
- PostgreSQL backup mechanism and retention;
- encrypted off-site backup destination;
- object storage backup/versioning policy for artwork, audio and video masters;
- secrets/configuration recovery procedure;
- responsible operators and escalation path.

No RPO or RTO value is invented in the repository before the actual hosting and business requirements are approved.

## Recovery exercise lifecycle

Recovery exercises are recorded through the internal recovery API and follow:

`PLANNED -> RUNNING -> PASSED | FAILED`

Every completed exercise requires an evidence reference and a structured result summary. Failed exercises remain evidence and must not be rewritten as successful.

## PostgreSQL restore exercise

A backup-restore exercise must use an isolated database target. The operator must:

1. select an immutable backup or point-in-time recovery target;
2. create an isolated restore destination;
3. restore the database without changing the active production database;
4. apply no speculative migrations during restore verification;
5. run integrity checks for organizations, memberships, catalog, releases, assets, rights, outbox, ledger and payout records;
6. start the API against the isolated restored database and verify readiness;
7. verify that pending outbox work is recoverable and that expired processing leases can be reclaimed;
8. record start time, completion time, restore point, evidence and result summary;
9. destroy or secure the isolated restored environment according to the data-handling policy.

## Failover and data recovery

Failover procedures must preserve one authoritative PostgreSQL writer. Data recovery must use explicit evidence and must never silently rebuild financial or rights data from projections.

Ledger entries, audit events, statements, payout records, rights evidence, authority evidence and release versions are treated as authoritative recovery data.

## Production gate

MISSION-041 is not operationally complete until at least one backup-restore exercise has passed against the real production-equivalent hosting stack. Repository support for planning and recording exercises does not substitute for that exercise.
