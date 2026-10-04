BEGIN;

CREATE TABLE production_cutovers (
  id uuid PRIMARY KEY,
  launch_decision_id uuid NOT NULL REFERENCES launch_decisions(id) ON DELETE RESTRICT,
  commit_sha text NOT NULL CHECK (commit_sha ~ '^[A-Fa-f0-9]{40}$'),
  migration_version text NOT NULL,
  configuration_version text NOT NULL,
  rollback_target text NOT NULL,
  status text NOT NULL CHECK (status IN ('PREPARED','ACTIVE','ABORTED','ROLLED_BACK')),
  prepared_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  prepared_at timestamptz NOT NULL,
  activated_by_user_id uuid NULL REFERENCES users(id) ON DELETE RESTRICT,
  activated_at timestamptz NULL,
  completed_by_user_id uuid NULL REFERENCES users(id) ON DELETE RESTRICT,
  completed_at timestamptz NULL,
  completion_reason text NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0)
);

CREATE INDEX production_cutovers_status_idx ON production_cutovers(status, prepared_at DESC);
CREATE UNIQUE INDEX production_cutovers_single_active_idx ON production_cutovers ((status)) WHERE status = 'ACTIVE';
CREATE UNIQUE INDEX production_cutovers_decision_idx ON production_cutovers(launch_decision_id) WHERE status IN ('PREPARED','ACTIVE');

INSERT INTO permissions (permission_key, description, created_at, permission_scope)
VALUES
  ('production.cutover.read', 'Read production cutover state', NOW(), 'SYSTEM'),
  ('production.cutover.manage', 'Prepare, activate, abort and roll back production cutovers', NOW(), 'SYSTEM')
ON CONFLICT (permission_key) DO UPDATE
SET description = EXCLUDED.description,
    permission_scope = EXCLUDED.permission_scope;

INSERT INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN permissions p ON p.permission_key IN ('production.cutover.read','production.cutover.manage')
WHERE r.id = '00000000-0000-4000-8000-000000000035'
ON CONFLICT DO NOTHING;

COMMIT;
