BEGIN;

ALTER TABLE marketing_smart_links
  ADD COLUMN link_type text NULL CHECK (link_type IN ('SMART_LINK','PRE_SAVE')),
  ADD COLUMN published_at timestamptz NULL;

UPDATE marketing_smart_links
SET link_type = 'SMART_LINK'
WHERE link_type IS NULL;

ALTER TABLE marketing_smart_links
  ALTER COLUMN link_type SET NOT NULL;

CREATE TABLE marketing_smart_link_events (
  id uuid PRIMARY KEY,
  smart_link_id uuid NOT NULL REFERENCES marketing_smart_links(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'PAGE_VIEW',
    'DESTINATION_CLICK',
    'PRESAVE_REQUESTED',
    'PRESAVE_CONFIRMED'
  )),
  destination_code text NULL,
  anonymous_session_id text NULL,
  referrer text NULL,
  utm_source text NULL,
  utm_medium text NULL,
  utm_campaign text NULL,
  occurred_at timestamptz NOT NULL
);

CREATE INDEX marketing_smart_link_events_metrics_idx
  ON marketing_smart_link_events(smart_link_id, event_type, occurred_at DESC);

COMMIT;
