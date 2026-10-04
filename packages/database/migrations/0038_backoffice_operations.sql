BEGIN;

ALTER TABLE operation_work_items
  ADD COLUMN priority text NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
  ADD COLUMN summary text NOT NULL DEFAULT '',
  ADD COLUMN blocked_reason text NULL,
  ADD COLUMN resolution text NULL,
  ADD COLUMN version bigint NOT NULL DEFAULT 1 CHECK (version > 0);

CREATE TABLE user_system_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL,
  assigned_by_user_id uuid NULL REFERENCES users(id) ON DELETE RESTRICT,
  PRIMARY KEY (user_id, role_id)
);

INSERT INTO permissions (permission_key, description, created_at)
VALUES
  ('backoffice.work.read', 'Read internal operation work queues and work items', NOW()),
  ('backoffice.work.manage', 'Assign and transition internal operation work items', NOW())
ON CONFLICT (permission_key) DO NOTHING;

INSERT INTO roles (id, organization_id, name, role_type, created_at, updated_at)
VALUES ('00000000-0000-4000-8000-000000000035', NULL, 'Backoffice Operator', 'SYSTEM', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_key)
VALUES
  ('00000000-0000-4000-8000-000000000035', 'backoffice.work.read'),
  ('00000000-0000-4000-8000-000000000035', 'backoffice.work.manage')
ON CONFLICT DO NOTHING;

CREATE INDEX operation_work_items_assignee_idx
  ON operation_work_items(assigned_user_id, status, due_at);

CREATE INDEX user_system_roles_user_idx ON user_system_roles(user_id, assigned_at DESC);

COMMIT;
