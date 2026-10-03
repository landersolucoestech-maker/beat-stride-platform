BEGIN;
CREATE TABLE rights_declarations (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  artist_identity_id uuid NULL REFERENCES artist_identities(id) ON DELETE RESTRICT,
  resource_type text NOT NULL CHECK (resource_type IN ('RELEASE','RECORDING')),
  resource_id uuid NOT NULL,
  scope text NOT NULL CHECK (scope IN ('MASTER_DISTRIBUTION','MASTER_EXPLOITATION')),
  status text NOT NULL CHECK (status IN ('DRAFT','ACTIVE','DISPUTED','REVOKED','EXPIRED')),
  territory_mode text NOT NULL CHECK (territory_mode IN ('WORLDWIDE','INCLUDE','EXCLUDE')),
  territories jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_reference text NULL,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX rights_declarations_resource_idx ON rights_declarations(resource_type, resource_id, status);
CREATE INDEX rights_declarations_organization_idx ON rights_declarations(organization_id, status);
COMMIT;
