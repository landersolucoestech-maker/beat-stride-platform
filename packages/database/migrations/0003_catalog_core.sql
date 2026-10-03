BEGIN;

CREATE TABLE releases (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  title text NOT NULL,
  release_type text NOT NULL CHECK (release_type IN ('SINGLE', 'EP', 'ALBUM')),
  status text NOT NULL CHECK (status IN ('DRAFT','READY_FOR_SUBMISSION','SUBMITTED','VALIDATING','CORRECTION_REQUIRED','RESUBMITTED','AUTHORIZATION_REQUIRED','MANUAL_REVIEW','REJECTED','APPROVED','SCHEDULED','DISTRIBUTING','LIVE','PARTIALLY_LIVE','DISTRIBUTION_FAILED')),
  current_version integer NOT NULL DEFAULT 1 CHECK (current_version > 0),
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX releases_organization_status_idx ON releases(organization_id, status, updated_at DESC);

CREATE TABLE release_versions (
  id uuid PRIMARY KEY,
  release_id uuid NOT NULL REFERENCES releases(id) ON DELETE RESTRICT,
  version_number integer NOT NULL CHECK (version_number > 0),
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (release_id, version_number)
);

CREATE TABLE recordings (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  title text NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE tracks (
  id uuid PRIMARY KEY,
  release_id uuid NOT NULL REFERENCES releases(id) ON DELETE RESTRICT,
  recording_id uuid NOT NULL REFERENCES recordings(id) ON DELETE RESTRICT,
  sequence integer NOT NULL CHECK (sequence > 0),
  title text NOT NULL,
  explicit boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (release_id, sequence)
);

CREATE INDEX tracks_recording_idx ON tracks(recording_id);

CREATE TABLE release_artist_credits (
  release_id uuid NOT NULL REFERENCES releases(id) ON DELETE RESTRICT,
  artist_identity_id uuid NOT NULL REFERENCES artist_identities(id) ON DELETE RESTRICT,
  credit_role text NOT NULL CHECK (credit_role IN ('PRIMARY', 'FEATURED')),
  display_order integer NOT NULL CHECK (display_order > 0),
  PRIMARY KEY (release_id, artist_identity_id, credit_role)
);

COMMIT;
