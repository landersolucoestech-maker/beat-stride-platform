BEGIN;

CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  normalized_email text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CLOSED')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE organizations (
  id uuid PRIMARY KEY,
  organization_type text NOT NULL CHECK (organization_type IN ('INDEPENDENT_ARTIST', 'COMPANY')),
  company_subtype text NULL CHECK (company_subtype IS NULL OR company_subtype IN ('LABEL', 'PRODUCER', 'PUBLISHER', 'MANAGEMENT', 'AGENCY', 'OTHER')),
  display_name text NOT NULL,
  legal_name text NULL,
  status text NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CLOSED')),
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT organization_classification_check CHECK (
    (organization_type = 'INDEPENDENT_ARTIST' AND company_subtype IS NULL)
    OR (organization_type = 'COMPANY' AND company_subtype IS NOT NULL)
  )
);

CREATE TABLE organization_memberships (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  role text NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
  status text NOT NULL CHECK (status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'REVOKED')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (organization_id, user_id)
);

CREATE INDEX organization_memberships_user_idx ON organization_memberships(user_id, status);
CREATE INDEX organization_memberships_organization_idx ON organization_memberships(organization_id, status);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY,
  organization_id uuid NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  actor_type text NOT NULL CHECK (actor_type IN ('USER', 'SERVICE', 'SYSTEM')),
  actor_id text NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  correlation_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX audit_events_resource_idx ON audit_events(resource_type, resource_id, occurred_at DESC);
CREATE INDEX audit_events_organization_idx ON audit_events(organization_id, occurred_at DESC);
CREATE INDEX audit_events_correlation_idx ON audit_events(correlation_id);

CREATE TABLE outbox_events (
  id uuid PRIMARY KEY,
  event_type text NOT NULL,
  event_version integer NOT NULL CHECK (event_version > 0),
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  correlation_id uuid NOT NULL,
  causation_id uuid NULL,
  actor jsonb NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'DEAD_LETTER')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  occurred_at timestamptz NOT NULL,
  available_at timestamptz NOT NULL,
  processed_at timestamptz NULL,
  last_error text NULL
);

CREATE INDEX outbox_events_pending_idx ON outbox_events(status, available_at) WHERE status IN ('PENDING', 'FAILED');

CREATE TABLE idempotency_keys (
  id uuid PRIMARY KEY,
  organization_id uuid NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  scope text NOT NULL,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  response_status integer NULL,
  response_body jsonb NULL,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  UNIQUE (organization_id, scope, idempotency_key)
);

COMMIT;
