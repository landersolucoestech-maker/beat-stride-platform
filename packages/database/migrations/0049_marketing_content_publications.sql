BEGIN;

ALTER TABLE marketing_campaigns
  DROP CONSTRAINT IF EXISTS marketing_campaigns_campaign_type_check;

ALTER TABLE marketing_campaigns
  ADD CONSTRAINT marketing_campaigns_campaign_type_check
  CHECK (campaign_type IN ('PRE_SAVE','DSP_PITCH','PROMOTION','PLAYLIST_TRACKING','CONTENT_PROMOTION'));

CREATE TABLE marketing_campaign_contents (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  campaign_id uuid NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  recording_id uuid NULL REFERENCES recordings(id) ON DELETE RESTRICT,
  asset_id uuid NULL REFERENCES assets(id) ON DELETE RESTRICT,
  content_type text NOT NULL CHECK (content_type IN (
    'TEASER',
    'TRAILER',
    'MUSIC_VIDEO',
    'VISUALIZER',
    'LYRIC_VIDEO',
    'SHORT_VIDEO',
    'REEL',
    'TIKTOK',
    'YOUTUBE_SHORT',
    'STORY',
    'FEED_POST',
    'CAROUSEL',
    'BEHIND_THE_SCENES',
    'AUDIO_SNIPPET',
    'ANNOUNCEMENT',
    'OTHER'
  )),
  title text NOT NULL,
  notes text NULL,
  status text NOT NULL CHECK (status IN ('DRAFT','READY','ARCHIVED')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX marketing_campaign_contents_campaign_idx
  ON marketing_campaign_contents(organization_id, campaign_id, status, updated_at DESC);

CREATE TABLE marketing_content_publications (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  content_id uuid NOT NULL REFERENCES marketing_campaign_contents(id) ON DELETE CASCADE,
  channel_code text NOT NULL CHECK (channel_code IN (
    'INSTAGRAM',
    'FACEBOOK',
    'TIKTOK',
    'YOUTUBE',
    'YOUTUBE_SHORTS'
  )),
  status text NOT NULL CHECK (status IN (
    'PLANNED',
    'READY',
    'SCHEDULED',
    'PUBLISHING',
    'PUBLISHED',
    'FAILED',
    'CANCELLED'
  )),
  scheduled_for timestamptz NULL,
  published_at timestamptz NULL,
  external_publication_id text NULL,
  external_url text NULL,
  last_error_code text NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX marketing_content_publications_content_idx
  ON marketing_content_publications(organization_id, content_id, status, scheduled_for);

COMMIT;
