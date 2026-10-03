BEGIN;
CREATE TABLE split_versions (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  resource_type text NOT NULL CHECK (resource_type IN ('RELEASE','RECORDING')),
  resource_id uuid NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  effective_from timestamptz NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (resource_type, resource_id, version)
);

CREATE TABLE split_participants (
  split_version_id uuid NOT NULL REFERENCES split_versions(id) ON DELETE RESTRICT,
  beneficiary_id uuid NOT NULL,
  share numeric(20,18) NOT NULL CHECK (share >= 0 AND share <= 1),
  PRIMARY KEY (split_version_id, beneficiary_id)
);
COMMIT;
