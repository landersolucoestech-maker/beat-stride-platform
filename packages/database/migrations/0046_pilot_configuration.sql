BEGIN;

CREATE TABLE pilot_configurations (
  id uuid PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('DRAFT','ACTIVE','RETIRED')),
  max_active_organizations integer NOT NULL CHECK (max_active_organizations > 0),
  max_releases_per_organization integer NOT NULL CHECK (max_releases_per_organization > 0),
  allowed_destinations jsonb NOT NULL DEFAULT '[]'::jsonb,
  allowed_territories jsonb NOT NULL DEFAULT '[]'::jsonb,
  payout_limit_amount numeric(20,8) NULL CHECK (payout_limit_amount IS NULL OR payout_limit_amount >= 0),
  payout_limit_currency char(3) NULL,
  manual_review_required boolean NOT NULL DEFAULT true,
  distribution_enabled boolean NOT NULL DEFAULT false,
  payouts_enabled boolean NOT NULL DEFAULT false,
  emergency_disable boolean NOT NULL DEFAULT false,
  created_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  activated_by_user_id uuid NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL,
  activated_at timestamptz NULL,
  retired_at timestamptz NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  CHECK ((payout_limit_amount IS NULL) = (payout_limit_currency IS NULL))
);

CREATE UNIQUE INDEX pilot_configurations_single_active_idx
  ON pilot_configurations(status)
  WHERE status = 'ACTIVE';

CREATE INDEX pilot_configurations_created_idx ON pilot_configurations(created_at DESC);

INSERT INTO permissions (permission_key, description, created_at, permission_scope)
VALUES
  ('pilot.config.read', 'Read pilot cohort and operational limit configuration', NOW(), 'SYSTEM'),
  ('pilot.config.manage', 'Create and transition pilot configuration', NOW(), 'SYSTEM')
ON CONFLICT (permission_key) DO UPDATE
SET description = EXCLUDED.description,
    permission_scope = EXCLUDED.permission_scope;

INSERT INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN permissions p ON p.permission_key IN ('pilot.config.read','pilot.config.manage')
WHERE r.id = '00000000-0000-4000-8000-000000000035'
ON CONFLICT DO NOTHING;

COMMIT;
