BEGIN;

CREATE TABLE webhook_inbox (
  id uuid PRIMARY KEY,
  source text NOT NULL,
  external_event_id text NOT NULL,
  signature_verified boolean NOT NULL,
  payload_hash text NOT NULL,
  status text NOT NULL CHECK (status IN ('RECEIVED','PROCESSING','PROCESSED','FAILED','REJECTED')),
  correlation_id uuid NOT NULL,
  received_at timestamptz NOT NULL,
  processed_at timestamptz NULL,
  last_error text NULL,
  UNIQUE (source, external_event_id)
);

CREATE TABLE security_events (
  id uuid PRIMARY KEY,
  organization_id uuid NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  actor_type text NOT NULL,
  actor_id text NULL,
  event_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('INFO','LOW','MEDIUM','HIGH','CRITICAL')),
  correlation_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE operational_incidents (
  id uuid PRIMARY KEY,
  incident_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('SEV4','SEV3','SEV2','SEV1')),
  status text NOT NULL CHECK (status IN ('OPEN','MITIGATING','MONITORING','RESOLVED','CLOSED')),
  started_at timestamptz NOT NULL,
  resolved_at timestamptz NULL,
  summary text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE recovery_exercises (
  id uuid PRIMARY KEY,
  exercise_type text NOT NULL CHECK (exercise_type IN ('BACKUP_RESTORE','FAILOVER','DATA_RECOVERY')),
  environment text NOT NULL,
  started_at timestamptz NOT NULL,
  completed_at timestamptz NULL,
  status text NOT NULL CHECK (status IN ('PLANNED','RUNNING','PASSED','FAILED')),
  evidence_reference text NULL,
  notes text NULL,
  created_at timestamptz NOT NULL
);

CREATE INDEX webhook_inbox_status_idx ON webhook_inbox(status, received_at);
CREATE INDEX security_events_org_idx ON security_events(organization_id, occurred_at DESC);
CREATE INDEX operational_incidents_status_idx ON operational_incidents(status, severity, started_at DESC);

COMMIT;
