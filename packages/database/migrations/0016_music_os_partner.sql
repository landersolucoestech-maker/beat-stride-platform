BEGIN;
CREATE TABLE partner_clients (
  id uuid PRIMARY KEY,
  partner_code text NOT NULL UNIQUE,
  display_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('ACTIVE','SUSPENDED','REVOKED')),
  scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE external_entity_mappings (
  id uuid PRIMARY KEY,
  integration_code text NOT NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  entity_type text NOT NULL,
  internal_entity_id text NOT NULL,
  external_entity_id text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (integration_code, entity_type, internal_entity_id),
  UNIQUE (integration_code, entity_type, external_entity_id)
);

CREATE TABLE partner_webhook_deliveries (
  id uuid PRIMARY KEY,
  partner_client_id uuid NOT NULL REFERENCES partner_clients(id) ON DELETE RESTRICT,
  event_id uuid NOT NULL,
  endpoint text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING','PROCESSING','DELIVERED','FAILED','DEAD_LETTER')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL,
  delivered_at timestamptz NULL,
  last_error text NULL,
  UNIQUE (partner_client_id, event_id)
);
COMMIT;
