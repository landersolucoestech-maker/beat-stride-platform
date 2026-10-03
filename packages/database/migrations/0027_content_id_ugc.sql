BEGIN;

CREATE TABLE content_id_enrollments (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  recording_id uuid NOT NULL REFERENCES recordings(id) ON DELETE RESTRICT,
  authority_claim_id uuid NULL REFERENCES authority_claims(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('PENDING','ACTIVE','SUSPENDED','DEACTIVATION_PENDING','INACTIVE')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (organization_id, recording_id)
);

CREATE TABLE ugc_allowlist_entries (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  recording_id uuid NOT NULL REFERENCES recordings(id) ON DELETE RESTRICT,
  platform_code text NOT NULL,
  channel_reference text NOT NULL,
  status text NOT NULL CHECK (status IN ('ACTIVE','REVOKED','EXPIRED')),
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (recording_id, platform_code, channel_reference)
);

CREATE TABLE content_id_claim_events (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  recording_id uuid NOT NULL REFERENCES recordings(id) ON DELETE RESTRICT,
  provider_code text NOT NULL,
  external_claim_id text NOT NULL,
  event_type text NOT NULL,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  UNIQUE (provider_code, external_claim_id, event_type, occurred_at)
);

COMMIT;
