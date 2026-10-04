BEGIN;

ALTER TABLE outbox_events
  ADD COLUMN processing_started_at timestamptz NULL,
  ADD COLUMN lease_expires_at timestamptz NULL;

UPDATE outbox_events
SET status = 'FAILED',
    available_at = NOW(),
    processing_started_at = NULL,
    lease_expires_at = NULL,
    last_error = COALESCE(last_error, 'Recovered during lease migration')
WHERE status = 'PROCESSING';

CREATE INDEX outbox_events_lease_idx
  ON outbox_events(status, lease_expires_at)
  WHERE status = 'PROCESSING';

COMMIT;
