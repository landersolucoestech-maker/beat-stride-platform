BEGIN;

CREATE TABLE permissions (
  permission_key text PRIMARY KEY,
  description text NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE TABLE roles (
  id uuid PRIMARY KEY,
  organization_id uuid NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  name text NOT NULL,
  role_type text NOT NULL CHECK (role_type IN ('SYSTEM','ORGANIZATION')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (organization_id, name)
);

CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_key text NOT NULL REFERENCES permissions(permission_key) ON DELETE RESTRICT,
  PRIMARY KEY (role_id, permission_key)
);

CREATE TABLE membership_roles (
  membership_id uuid NOT NULL REFERENCES organization_memberships(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  assigned_at timestamptz NOT NULL,
  PRIMARY KEY (membership_id, role_id)
);

COMMIT;
