BEGIN;

CREATE TABLE auth_login_throttle (
  identity_hash text PRIMARY KEY CHECK (identity_hash ~ '^[A-Fa-f0-9]{64}$'),
  failed_count integer NOT NULL CHECK (failed_count > 0),
  first_failed_at timestamptz NOT NULL,
  locked_until timestamptz NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX auth_login_throttle_lock_idx ON auth_login_throttle(locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX auth_sessions_active_user_idx ON auth_sessions(user_id, created_at DESC) WHERE revoked_at IS NULL;
CREATE INDEX security_events_type_idx ON security_events(event_type, occurred_at DESC);

COMMIT;
