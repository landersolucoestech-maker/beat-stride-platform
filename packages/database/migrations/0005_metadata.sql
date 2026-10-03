BEGIN;
CREATE TABLE release_metadata_versions (
  id uuid PRIMARY KEY,
  release_id uuid NOT NULL REFERENCES releases(id) ON DELETE RESTRICT,
  release_version integer NOT NULL CHECK (release_version > 0),
  language text NOT NULL,
  primary_genre text NOT NULL,
  release_date date NOT NULL,
  copyright_line text NOT NULL,
  phonographic_copyright_line text NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (release_id, release_version)
);
COMMIT;
