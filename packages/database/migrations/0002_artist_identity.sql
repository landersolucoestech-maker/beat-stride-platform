BEGIN;

CREATE TABLE artist_identities (
  id uuid PRIMARY KEY,
  canonical_name text NOT NULL,
  normalized_name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('PERSON', 'DUO', 'GROUP', 'PROJECT')),
  status text NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX artist_identities_normalized_name_idx ON artist_identities(normalized_name);

CREATE TABLE artist_associations (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  artist_identity_id uuid NOT NULL REFERENCES artist_identities(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (organization_id, artist_identity_id)
);

CREATE INDEX artist_associations_organization_idx ON artist_associations(organization_id, status);
CREATE INDEX artist_associations_artist_idx ON artist_associations(artist_identity_id, status);

COMMIT;
