BEGIN;

CREATE TABLE creators_connections (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  external_organization_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING','ACTIVE','REVOKED','ERROR')),
  granted_scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  credential_secret_reference text NULL,
  connected_at timestamptz NULL,
  revoked_at timestamptz NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (organization_id)
);

CREATE TABLE creators_external_entity_mappings (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  local_entity_type text NOT NULL CHECK (local_entity_type IN ('RELEASE','RECORDING')),
  local_entity_id uuid NOT NULL,
  external_entity_type text NOT NULL,
  external_entity_id text NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (organization_id, local_entity_type, local_entity_id, external_entity_type)
);

CREATE TABLE creators_campaign_projections (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  release_id uuid NOT NULL REFERENCES releases(id) ON DELETE RESTRICT,
  external_campaign_id text NOT NULL,
  external_order_id text NULL,
  status text NOT NULL,
  payment_status text NULL,
  package_reference text NULL,
  checkout_reference text NULL,
  last_synced_at timestamptz NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (organization_id, external_campaign_id)
);

CREATE INDEX creators_campaign_projection_release_idx ON creators_campaign_projections(organization_id, release_id);

COMMIT;
