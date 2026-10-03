BEGIN;
CREATE TABLE royalty_lines (
  id uuid PRIMARY KEY,
  statement_id uuid NOT NULL REFERENCES statements(id) ON DELETE RESTRICT,
  source_line_reference text NOT NULL,
  release_id uuid NULL REFERENCES releases(id) ON DELETE RESTRICT,
  recording_id uuid NULL REFERENCES recordings(id) ON DELETE RESTRICT,
  territory_code text NULL,
  destination_code text NULL,
  usage_type text NOT NULL,
  usage_count numeric(38,0) NULL,
  gross_amount numeric(38,18) NOT NULL,
  currency char(3) NOT NULL,
  matched boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL,
  UNIQUE (statement_id, source_line_reference)
);
CREATE INDEX royalty_lines_recording_idx ON royalty_lines(recording_id);
CREATE INDEX royalty_lines_release_idx ON royalty_lines(release_id);
COMMIT;
