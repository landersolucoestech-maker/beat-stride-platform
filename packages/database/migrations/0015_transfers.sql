BEGIN;
CREATE TABLE catalog_transfers (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  direction text NOT NULL CHECK (direction IN ('IMPORT','EXPORT')),
  status text NOT NULL CHECK (status IN ('DRAFT','VALIDATING','CONFLICT_CHECK','CORRECTION_REQUIRED','READY','IN_PROGRESS','PARTIAL','FAILED','COMPLETED')),
  preserve_identifiers boolean NOT NULL DEFAULT true,
  item_count integer NOT NULL CHECK (item_count > 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE catalog_transfer_items (
  id uuid PRIMARY KEY,
  transfer_id uuid NOT NULL REFERENCES catalog_transfers(id) ON DELETE RESTRICT,
  source_identifier text NOT NULL,
  target_entity_id text NULL,
  status text NOT NULL CHECK (status IN ('PENDING','VALID','CONFLICT','IN_PROGRESS','FAILED','COMPLETED')),
  error_code text NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX catalog_transfer_items_transfer_idx ON catalog_transfer_items(transfer_id, status);
COMMIT;
