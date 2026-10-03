BEGIN;
CREATE TABLE statements (
  id uuid PRIMARY KEY,
  organization_id uuid NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  provider_code text NOT NULL,
  source_reference text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  currency char(3) NOT NULL,
  status text NOT NULL CHECK (status IN ('RECEIVED','PARSING','NORMALIZING','MATCHING','EXCEPTIONS','RECONCILING','POSTED','CLOSED')),
  file_asset_id uuid NULL REFERENCES assets(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (provider_code, source_reference)
);
COMMIT;
