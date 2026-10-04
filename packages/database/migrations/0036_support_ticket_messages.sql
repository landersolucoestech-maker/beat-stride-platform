BEGIN;

CREATE TABLE support_ticket_messages (
  id uuid PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_user_id uuid NULL REFERENCES users(id) ON DELETE RESTRICT,
  body text NOT NULL CHECK (char_length(trim(body)) > 0),
  created_at timestamptz NOT NULL
);

CREATE INDEX support_ticket_messages_ticket_idx
  ON support_ticket_messages(ticket_id, created_at ASC, id ASC);

COMMIT;
