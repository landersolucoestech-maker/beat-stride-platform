BEGIN;
CREATE TABLE artist_protections (
  id uuid PRIMARY KEY,
  artist_identity_id uuid NOT NULL UNIQUE REFERENCES artist_identities(id) ON DELETE RESTRICT,
  controller_organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('INACTIVE','PENDING_ACTIVATION','ACTIVE','CONTROLLER_TRANSITION','SUSPENDED','DEACTIVATION_PENDING')),
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE protection_controller_history (
  id uuid PRIMARY KEY,
  artist_protection_id uuid NOT NULL REFERENCES artist_protections(id) ON DELETE RESTRICT,
  from_organization_id uuid NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  to_organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  changed_at timestamptz NOT NULL
);
COMMIT;
