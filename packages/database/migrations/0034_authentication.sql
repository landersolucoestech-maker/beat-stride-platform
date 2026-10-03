BEGIN;

CREATE TABLE user_credentials (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  password_salt text NOT NULL,
  password_algorithm text NOT NULL CHECK (password_algorithm = 'SCRYPT'),
  password_version integer NOT NULL DEFAULT 1 CHECK (password_version > 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE auth_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz NULL,
  created_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL
);

CREATE INDEX auth_sessions_user_idx ON auth_sessions(user_id, expires_at DESC);
CREATE INDEX auth_sessions_active_idx ON auth_sessions(expires_at) WHERE revoked_at IS NULL;

COMMIT;
