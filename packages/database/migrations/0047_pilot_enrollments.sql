BEGIN;

CREATE TABLE pilot_enrollments (
  id uuid PRIMARY KEY,
  pilot_configuration_id uuid NOT NULL REFERENCES pilot_configurations(id) ON DELETE RESTRICT,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('INVITED','ACTIVE','SUSPENDED','EXITED')),
  release_limit_override integer NULL CHECK (release_limit_override IS NULL OR release_limit_override > 0),
  notes text NULL,
  enrolled_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  enrolled_at timestamptz NOT NULL,
  activated_at timestamptz NULL,
  suspended_at timestamptz NULL,
  exited_at timestamptz NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  UNIQUE (pilot_configuration_id, organization_id)
);

CREATE INDEX pilot_enrollments_status_idx
  ON pilot_enrollments(pilot_configuration_id, status, enrolled_at ASC);

INSERT INTO permissions (permission_key, description, created_at, permission_scope)
VALUES
  ('pilot.enrollment.read', 'Read pilot organization enrollment state', NOW(), 'SYSTEM'),
  ('pilot.enrollment.manage', 'Invite and transition pilot organization enrollment state', NOW(), 'SYSTEM')
ON CONFLICT (permission_key) DO UPDATE
SET description = EXCLUDED.description,
    permission_scope = EXCLUDED.permission_scope;

INSERT INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN permissions p ON p.permission_key IN ('pilot.enrollment.read','pilot.enrollment.manage')
WHERE r.id = '00000000-0000-4000-8000-000000000035'
ON CONFLICT DO NOTHING;

COMMIT;
