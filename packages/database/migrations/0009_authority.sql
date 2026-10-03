BEGIN;
CREATE TABLE artist_representations (
  id uuid PRIMARY KEY,
  artist_identity_id uuid NOT NULL REFERENCES artist_identities(id) ON DELETE RESTRICT,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('REQUESTED','EVIDENCE_PENDING','UNDER_REVIEW','REJECTED','DISPUTED','ACTIVE','TERMINATION_REQUESTED','TRANSITIONING','TERMINATED')),
  evidence_reference text NULL,
  valid_from timestamptz NULL,
  valid_until timestamptz NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX artist_representations_artist_idx ON artist_representations(artist_identity_id, status);
CREATE INDEX artist_representations_organization_idx ON artist_representations(organization_id, status);

CREATE TABLE authority_grants (
  id uuid PRIMARY KEY,
  artist_identity_id uuid NOT NULL REFERENCES artist_identities(id) ON DELETE RESTRICT,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  resource_type text NOT NULL CHECK (resource_type IN ('ARTIST','RELEASE','CATALOG')),
  resource_id text NOT NULL,
  scope text NOT NULL CHECK (scope IN ('DISTRIBUTION_SUBMIT','RIGHTS_DECLARE','PROTECTION_MANAGE','DIRECT_AUTHORIZATION_MANAGE','TAKEDOWN_REQUEST','TRANSFER_MANAGE')),
  status text NOT NULL CHECK (status IN ('ACTIVE','SUSPENDED','REVOKED','EXPIRED','DISPUTED')),
  evidence_reference text NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX authority_grants_lookup_idx ON authority_grants(artist_identity_id, organization_id, scope, status);
COMMIT;
