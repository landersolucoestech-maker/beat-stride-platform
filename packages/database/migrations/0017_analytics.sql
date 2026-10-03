BEGIN;
CREATE TABLE analytics_metrics (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  provider_code text NOT NULL,
  metric_date date NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('STREAM','VIEW','SAVE','PLAYLIST_ADD')),
  release_id uuid NULL REFERENCES releases(id) ON DELETE RESTRICT,
  recording_id uuid NULL REFERENCES recordings(id) ON DELETE RESTRICT,
  destination_code text NULL,
  territory_code text NULL,
  metric_value numeric(38,0) NOT NULL CHECK (metric_value >= 0),
  created_at timestamptz NOT NULL
);
CREATE INDEX analytics_metrics_query_idx ON analytics_metrics(organization_id, metric_date, metric_type);
COMMIT;
