BEGIN;

ALTER TABLE automation_runs
  ADD COLUMN risk_level text NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  ADD COLUMN version bigint NOT NULL DEFAULT 1 CHECK (version > 0);

CREATE TABLE automation_approvals (
  id uuid PRIMARY KEY,
  automation_run_id uuid NOT NULL REFERENCES automation_runs(id) ON DELETE RESTRICT,
  decision text NOT NULL CHECK (decision IN ('PENDING','APPROVED','REJECTED')),
  requested_at timestamptz NOT NULL,
  decided_at timestamptz NULL,
  decided_by_user_id uuid NULL REFERENCES users(id) ON DELETE RESTRICT,
  decision_reason text NULL,
  UNIQUE (automation_run_id)
);

INSERT INTO permissions (permission_key, description, created_at)
VALUES
  ('automation.run.read', 'Read controlled automation runs and tool invocations', NOW()),
  ('automation.run.manage', 'Request or cancel controlled automation runs', NOW()),
  ('automation.run.approve', 'Approve or reject approval-gated automation runs', NOW())
ON CONFLICT (permission_key) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_key)
VALUES
  ('00000000-0000-4000-8000-000000000035', 'automation.run.read'),
  ('00000000-0000-4000-8000-000000000035', 'automation.run.manage'),
  ('00000000-0000-4000-8000-000000000035', 'automation.run.approve')
ON CONFLICT DO NOTHING;

CREATE INDEX automation_runs_status_idx ON automation_runs(status, risk_level, created_at DESC);
CREATE INDEX automation_approvals_pending_idx ON automation_approvals(decision, requested_at) WHERE decision = 'PENDING';

COMMIT;
