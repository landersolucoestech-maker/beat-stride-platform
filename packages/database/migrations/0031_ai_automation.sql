BEGIN;

CREATE TABLE automation_runs (
  id uuid PRIMARY KEY,
  organization_id uuid NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  automation_type text NOT NULL,
  autonomy_mode text NOT NULL CHECK (autonomy_mode IN ('AUTO','CONTROLLED','APPROVAL_GATED')),
  resource_type text NULL,
  resource_id uuid NULL,
  status text NOT NULL CHECK (status IN ('PENDING','RUNNING','AWAITING_APPROVAL','SUCCEEDED','FAILED','CANCELLED')),
  correlation_id uuid NOT NULL,
  requested_by_actor jsonb NOT NULL,
  input_summary jsonb NOT NULL,
  output_summary jsonb NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL
);

CREATE TABLE automation_tool_invocations (
  id uuid PRIMARY KEY,
  automation_run_id uuid NOT NULL REFERENCES automation_runs(id) ON DELETE RESTRICT,
  tool_name text NOT NULL,
  reversible boolean NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING','RUNNING','SUCCEEDED','FAILED','REJECTED')),
  request_summary jsonb NOT NULL,
  result_summary jsonb NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL
);

CREATE INDEX automation_runs_resource_idx ON automation_runs(organization_id, resource_type, resource_id, created_at);

COMMIT;
