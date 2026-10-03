BEGIN;

CREATE TABLE risk_cases (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  category text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text NOT NULL CHECK (status IN ('OPEN','UNDER_REVIEW','ACTION_REQUIRED','RESOLVED','DISMISSED')),
  opened_at timestamptz NOT NULL,
  resolved_at timestamptz NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE support_tickets (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  opened_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  subject text NOT NULL,
  category text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
  status text NOT NULL CHECK (status IN ('OPEN','WAITING_CUSTOMER','WAITING_INTERNAL','RESOLVED','CLOSED')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE operation_work_items (
  id uuid PRIMARY KEY,
  organization_id uuid NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  work_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('OPEN','ASSIGNED','IN_PROGRESS','BLOCKED','COMPLETED','CANCELLED')),
  assigned_user_id uuid NULL REFERENCES users(id) ON DELETE RESTRICT,
  due_at timestamptz NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX risk_cases_resource_idx ON risk_cases(organization_id, resource_type, resource_id, status);
CREATE INDEX operation_work_items_queue_idx ON operation_work_items(status, work_type, due_at);

COMMIT;
