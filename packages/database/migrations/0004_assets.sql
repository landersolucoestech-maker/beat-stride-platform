BEGIN;
CREATE TABLE assets (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  asset_type text NOT NULL CHECK (asset_type IN ('ARTWORK','AUDIO_MASTER','VIDEO_MASTER','DOCUMENT','OTHER')),
  status text NOT NULL CHECK (status IN ('PENDING_UPLOAD','AVAILABLE','QUARANTINED','REJECTED','DELETED')),
  storage_key text NOT NULL UNIQUE,
  file_name text NOT NULL,
  content_type text NOT NULL,
  byte_size bigint NULL CHECK (byte_size IS NULL OR byte_size > 0),
  checksum_sha256 text NULL CHECK (checksum_sha256 IS NULL OR checksum_sha256 ~ '^[A-Fa-f0-9]{64}$'),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX assets_organization_type_idx ON assets(organization_id, asset_type, status);
COMMIT;
