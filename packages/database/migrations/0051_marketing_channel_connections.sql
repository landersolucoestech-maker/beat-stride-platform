BEGIN;

CREATE TABLE marketing_channel_connections (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  provider_code text NOT NULL CHECK (provider_code IN ('META','TIKTOK','YOUTUBE')),
  status text NOT NULL CHECK (status IN ('PENDING','ACTIVE','REAUTH_REQUIRED','REVOKED','ERROR')),
  external_account_id text NULL,
  external_account_name text NULL,
  granted_scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  credential_secret_reference text NULL,
  connected_at timestamptz NULL,
  revoked_at timestamptz NULL,
  last_error_code text NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (organization_id, provider_code)
);

CREATE INDEX marketing_channel_connections_status_idx
  ON marketing_channel_connections(organization_id, status, provider_code);

INSERT INTO permissions (permission_key, description, created_at, permission_scope)
VALUES
  ('marketing.integration.read', 'Read organization marketing channel integration state', NOW(), 'ORGANIZATION'),
  ('marketing.integration.connect', 'Connect organization marketing publication channels', NOW(), 'ORGANIZATION'),
  ('marketing.integration.disconnect', 'Disconnect organization marketing publication channels', NOW(), 'ORGANIZATION')
ON CONFLICT (permission_key) DO UPDATE
SET description = EXCLUDED.description,
    permission_scope = EXCLUDED.permission_scope;

INSERT INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN permissions p ON p.permission_key = 'marketing.integration.read'
WHERE r.role_type = 'ORGANIZATION'
  AND r.name IN ('Organization Owner','Organization Admin','Organization Member')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN permissions p ON p.permission_key IN ('marketing.integration.connect','marketing.integration.disconnect')
WHERE r.role_type = 'ORGANIZATION'
  AND r.name IN ('Organization Owner','Organization Admin')
ON CONFLICT DO NOTHING;

COMMIT;
