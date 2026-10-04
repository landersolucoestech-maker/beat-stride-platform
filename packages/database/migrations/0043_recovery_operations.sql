BEGIN;

ALTER TABLE recovery_exercises
  ADD COLUMN initiated_by_user_id uuid NULL REFERENCES users(id) ON DELETE RESTRICT,
  ADD COLUMN restore_point_at timestamptz NULL,
  ADD COLUMN result_summary jsonb NULL,
  ADD COLUMN version bigint NOT NULL DEFAULT 1 CHECK (version > 0);

INSERT INTO permissions (permission_key, description, created_at, permission_scope)
VALUES
  ('recovery.exercise.read', 'Read disaster recovery exercise history and evidence', NOW(), 'SYSTEM'),
  ('recovery.exercise.manage', 'Plan and transition disaster recovery exercises', NOW(), 'SYSTEM')
ON CONFLICT (permission_key) DO UPDATE
SET description = EXCLUDED.description,
    permission_scope = EXCLUDED.permission_scope;

INSERT INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN permissions p ON p.permission_key IN ('recovery.exercise.read','recovery.exercise.manage')
WHERE r.id = '00000000-0000-4000-8000-000000000035'
ON CONFLICT DO NOTHING;

CREATE INDEX recovery_exercises_status_started_idx
  ON recovery_exercises(status, started_at DESC);

COMMIT;
