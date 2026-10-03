BEGIN;
CREATE TABLE distribution_providers (
  provider_code text PRIMARY KEY,
  display_name text NOT NULL,
  health text NOT NULL CHECK (health IN ('HEALTHY','DEGRADED','UNAVAILABLE','UNKNOWN')),
  capabilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL
);

CREATE TABLE provider_entity_mappings (
  id uuid PRIMARY KEY,
  provider_code text NOT NULL REFERENCES distribution_providers(provider_code) ON DELETE RESTRICT,
  entity_type text NOT NULL,
  internal_entity_id text NOT NULL,
  external_entity_id text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (provider_code, entity_type, internal_entity_id),
  UNIQUE (provider_code, entity_type, external_entity_id)
);

CREATE TABLE provider_webhook_inbox (
  id uuid PRIMARY KEY,
  provider_code text NOT NULL REFERENCES distribution_providers(provider_code) ON DELETE RESTRICT,
  external_event_id text NOT NULL,
  signature_valid boolean NOT NULL,
  payload_hash text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('RECEIVED','PROCESSING','PROCESSED','FAILED','IGNORED')),
  received_at timestamptz NOT NULL,
  processed_at timestamptz NULL,
  UNIQUE (provider_code, external_event_id)
);
COMMIT;
