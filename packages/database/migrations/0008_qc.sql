BEGIN;
CREATE TABLE qc_reviews (
  id uuid PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('PENDING','RUNNING','PASS','WARNING','BLOCKING_ERROR','MANUAL_REVIEW','CORRECTION_REQUIRED','REJECTED','APPROVED')),
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX qc_reviews_submission_idx ON qc_reviews(submission_id, created_at DESC);
COMMIT;
