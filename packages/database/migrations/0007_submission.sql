BEGIN;
CREATE TABLE submissions (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  release_id uuid NOT NULL REFERENCES releases(id) ON DELETE RESTRICT,
  release_version integer NOT NULL CHECK (release_version > 0),
  status text NOT NULL CHECK (status IN ('PENDING','VALIDATING','CORRECTION_REQUIRED','APPROVED','REJECTED')),
  submitted_by_actor_id text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX submissions_release_idx ON submissions(release_id, created_at DESC);
COMMIT;
