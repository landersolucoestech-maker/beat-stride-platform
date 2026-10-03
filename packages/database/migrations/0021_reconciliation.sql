BEGIN;
CREATE TABLE reconciliation_items (
  id uuid PRIMARY KEY,
  statement_id uuid NOT NULL REFERENCES statements(id) ON DELETE RESTRICT,
  royalty_line_id uuid NOT NULL UNIQUE REFERENCES royalty_lines(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('UNMATCHED','MATCHED','EXCEPTION','RESOLVED','POSTED')),
  release_id uuid NULL REFERENCES releases(id) ON DELETE RESTRICT,
  recording_id uuid NULL REFERENCES recordings(id) ON DELETE RESTRICT,
  split_version_id uuid NULL REFERENCES split_versions(id) ON DELETE RESTRICT,
  exception_code text NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX reconciliation_items_statement_idx ON reconciliation_items(statement_id, status);
COMMIT;
