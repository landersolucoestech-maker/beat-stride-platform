BEGIN;

CREATE TABLE content_id_enrollments (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  recording_id uuid NOT NULL REFERENCES recordings(id) ON DELETE RESTRICT,
  authority_grant_id uuid NULL REFERENCES authority_grants(id) ON DELETE RESTRICT,
  provider_code text NULL,
  status text NOT NULL CHECK (status IN ('DRAFT','ELIGIBILITY_CHECK','INELIGIBLE','AUTHORIZATION_REQUIRED','READY','SUBMITTED','ACTIVE','REJECTED','SUSPENDED','DEACTIVATION_PENDING','DEACTIVATED')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (organization_id, recording_id)
);

CREATE INDEX content_id_enrollments_organization_status_idx
  ON content_id_enrollments(organization_id, status, updated_at DESC);

CREATE TABLE ugc_allowlist_entries (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  recording_id uuid NOT NULL REFERENCES recordings(id) ON DELETE RESTRICT,
  platform_code text NOT NULL,
  channel_reference text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING','ACTIVE','REVOKED','EXPIRED')),
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (recording_id, platform_code, channel_reference)
);

CREATE INDEX ugc_allowlist_entries_organization_status_idx
  ON ugc_allowlist_entries(organization_id, status, created_at DESC);

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

CREATE INDEX content_id_claim_events_recording_idx
  ON content_id_claim_events(organization_id, recording_id, occurred_at DESC);

COMMIT;
