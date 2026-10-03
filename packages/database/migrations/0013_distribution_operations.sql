BEGIN;
CREATE TABLE deliveries (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  release_id uuid NOT NULL REFERENCES releases(id) ON DELETE RESTRICT,
  release_version integer NOT NULL CHECK (release_version > 0),
  provider_code text NOT NULL REFERENCES distribution_providers(provider_code) ON DELETE RESTRICT,
  destination_code text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING','VALIDATING','SCHEDULED','SENT','DELIVERED','ACKNOWLEDGED','PROCESSING','LIVE','REJECTED','FAILED','CORRECTION_REQUIRED','UPDATE_PENDING','TAKEDOWN_REQUESTED','TAKEN_DOWN')),
  provider_operation_id text NULL,
  provider_status text NULL,
  last_error_code text NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (release_id, release_version, provider_code, destination_code)
);
CREATE INDEX deliveries_release_idx ON deliveries(release_id, status);
CREATE INDEX deliveries_provider_operation_idx ON deliveries(provider_code, provider_operation_id);
COMMIT;
