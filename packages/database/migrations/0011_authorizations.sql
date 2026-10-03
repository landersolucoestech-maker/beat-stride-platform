BEGIN;
CREATE TABLE artist_authorizations (
  id uuid PRIMARY KEY,
  artist_identity_id uuid NOT NULL REFERENCES artist_identities(id) ON DELETE RESTRICT,
  grantor_organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  grantee_organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  authorization_type text NOT NULL CHECK (authorization_type IN ('ONE_TIME','RELEASE','CATALOG','DIRECT')),
  resource_id text NULL,
  status text NOT NULL CHECK (status IN ('PENDING','ACTIVE','REJECTED','REVOKED','EXPIRED')),
  scope jsonb NOT NULL,
  valid_from timestamptz NULL,
  valid_until timestamptz NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX artist_authorizations_artist_idx ON artist_authorizations(artist_identity_id, status, authorization_type);
CREATE INDEX artist_authorizations_grantee_idx ON artist_authorizations(grantee_organization_id, status);
COMMIT;
