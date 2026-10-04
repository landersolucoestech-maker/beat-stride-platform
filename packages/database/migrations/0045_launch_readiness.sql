BEGIN;

CREATE TABLE launch_gate_requirements (
  requirement_key text PRIMARY KEY,
  gate text NOT NULL CHECK (gate IN ('PRODUCTION_READINESS','PILOT','PRODUCTION')),
  title text NOT NULL,
  description text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL
);

CREATE TABLE launch_gate_evidence (
  id uuid PRIMARY KEY,
  requirement_key text NOT NULL REFERENCES launch_gate_requirements(requirement_key) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('PENDING','BLOCKED','PASSED','FAILED')),
  evidence_reference text NULL,
  notes text NULL,
  recorded_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  recorded_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0)
);

CREATE INDEX launch_gate_evidence_requirement_idx
  ON launch_gate_evidence(requirement_key, recorded_at DESC);

CREATE TABLE launch_decisions (
  id uuid PRIMARY KEY,
  gate text NOT NULL CHECK (gate IN ('PILOT','PRODUCTION')),
  decision text NOT NULL CHECK (decision IN ('APPROVED','REJECTED')),
  commit_sha text NOT NULL CHECK (commit_sha ~ '^[A-Fa-f0-9]{40}$'),
  migration_version text NOT NULL,
  provider_configuration_version text NULL,
  accepted_risks jsonb NOT NULL DEFAULT '[]'::jsonb,
  rollback_target text NOT NULL,
  decided_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  decided_at timestamptz NOT NULL,
  notes text NULL
);

CREATE INDEX launch_decisions_gate_idx ON launch_decisions(gate, decided_at DESC);

INSERT INTO launch_gate_requirements (requirement_key, gate, title, description, required, created_at)
VALUES
  ('readiness.ci.green', 'PRODUCTION_READINESS', 'CI green on main', 'Frontend, API, worker and PostgreSQL migration validation pass from main.', true, NOW()),
  ('readiness.tenant_isolation', 'PRODUCTION_READINESS', 'Tenant isolation verified', 'Organization-scoped reads and writes have automated isolation evidence.', true, NOW()),
  ('readiness.security_review', 'PRODUCTION_READINESS', 'Security review', 'Authentication, authorization, secrets, webhooks, uploads, PII and financial controls are reviewed.', true, NOW()),
  ('readiness.recovery_evidence', 'PRODUCTION_READINESS', 'Recovery evidence', 'A production-equivalent backup restore exercise has passed.', true, NOW()),
  ('readiness.provider_contract', 'PRODUCTION_READINESS', 'Distribution provider contract', 'A real distribution provider contract and verified capability matrix exist.', true, NOW()),
  ('readiness.payout_contract', 'PRODUCTION_READINESS', 'Payout provider contract', 'Country, currency, payment and payout support are verified against a real provider.', true, NOW()),
  ('readiness.compliance_approval', 'PRODUCTION_READINESS', 'Compliance approval', 'KYC/KYB and regulatory procedures are approved for enabled markets.', true, NOW()),
  ('pilot.production_readiness', 'PILOT', 'Production readiness gate', 'All required production-readiness checks have passed.', true, NOW()),
  ('pilot.provider_sandbox', 'PILOT', 'Provider sandbox evidence', 'Provider delivery, retry, update, takedown and transfer behavior are exercised against a real sandbox or staging contract.', true, NOW()),
  ('pilot.finance_e2e', 'PILOT', 'Finance end-to-end evidence', 'Statement ingestion through payout eligibility and reconciliation has test evidence.', true, NOW()),
  ('pilot.backup_restore', 'PILOT', 'Pilot backup restore', 'Backup restore evidence exists for the pilot environment.', true, NOW()),
  ('pilot.cohort_configuration', 'PILOT', 'Pilot cohort limits', 'Pilot organizations, release limits, destinations, territories, payout limits and emergency switches are configured.', true, NOW()),
  ('pilot.incident_ownership', 'PILOT', 'Incident ownership', 'Incident runbook ownership and escalation paths are assigned.', true, NOW()),
  ('production.pilot_exit', 'PRODUCTION', 'Pilot exit criteria', 'Pilot evidence demonstrates stable operation and all pilot exit criteria have passed.', true, NOW()),
  ('production.no_sev1_sev2', 'PRODUCTION', 'No unresolved severe defects', 'No unresolved severity-1 or severity-2 defect remains.', true, NOW()),
  ('production.financial_integrity', 'PRODUCTION', 'Financial integrity', 'No unresolved ledger imbalance or unexplained reconciliation variance remains.', true, NOW()),
  ('production.capacity_evidence', 'PRODUCTION', 'Capacity evidence', 'Capacity assumptions and alert thresholds are based on observed pilot metrics.', true, NOW()),
  ('production.hosting_verified', 'PRODUCTION', 'Production hosting verified', 'DNS, TLS, Hostinger runtime, database, storage, monitoring and deployment credentials are verified.', true, NOW()),
  ('production.support_ready', 'PRODUCTION', 'Support and backoffice ready', 'Support and internal operational procedures are active.', true, NOW())
ON CONFLICT (requirement_key) DO NOTHING;

INSERT INTO permissions (permission_key, description, created_at, permission_scope)
VALUES
  ('launch.readiness.read', 'Read production readiness, pilot and production gate evidence', NOW(), 'SYSTEM'),
  ('launch.readiness.manage', 'Record launch gate evidence', NOW(), 'SYSTEM'),
  ('launch.decision.approve', 'Approve or reject pilot and production launch decisions', NOW(), 'SYSTEM')
ON CONFLICT (permission_key) DO UPDATE
SET description = EXCLUDED.description,
    permission_scope = EXCLUDED.permission_scope;

INSERT INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN permissions p ON p.permission_key IN ('launch.readiness.read','launch.readiness.manage','launch.decision.approve')
WHERE r.id = '00000000-0000-4000-8000-000000000035'
ON CONFLICT DO NOTHING;

COMMIT;
