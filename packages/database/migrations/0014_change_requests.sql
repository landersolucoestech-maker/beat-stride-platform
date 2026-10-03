BEGIN;
CREATE TABLE distribution_change_requests (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  release_id uuid NOT NULL REFERENCES releases(id) ON DELETE RESTRICT,
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE RESTRICT,
  request_type text NOT NULL CHECK (request_type IN ('UPDATE','TAKEDOWN')),
  status text NOT NULL CHECK (status IN ('REQUESTED','VALIDATING','APPROVED','SENT','COMPLETED','REJECTED','FAILED')),
  reason text NOT NULL,
  requested_by_actor_id text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX distribution_change_requests_release_idx ON distribution_change_requests(release_id, created_at DESC);
COMMIT;
