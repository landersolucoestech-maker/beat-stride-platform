BEGIN;

ALTER TABLE marketing_campaigns
  ADD COLUMN name text NULL,
  ADD COLUMN objective text NULL,
  ADD COLUMN focus_recording_id uuid NULL REFERENCES recordings(id) ON DELETE RESTRICT,
  ADD COLUMN brief text NULL,
  ADD COLUMN budget_minor bigint NULL CHECK (budget_minor IS NULL OR budget_minor >= 0),
  ADD COLUMN budget_currency text NULL CHECK (budget_currency IS NULL OR budget_currency ~ '^[A-Z]{3}$');

UPDATE marketing_campaigns campaign
SET name = release.title || ' — ' ||
  CASE campaign.campaign_type
    WHEN 'PRE_SAVE' THEN 'Pré-save'
    WHEN 'DSP_PITCH' THEN 'DSP Pitch'
    WHEN 'PROMOTION' THEN 'Promoção'
    WHEN 'PLAYLIST_TRACKING' THEN 'Playlists'
    WHEN 'CONTENT_PROMOTION' THEN 'Conteúdos'
    ELSE 'Marketing'
  END
FROM releases release
WHERE release.id = campaign.release_id
  AND campaign.name IS NULL;

ALTER TABLE marketing_campaigns
  ALTER COLUMN name SET NOT NULL;

CREATE TABLE marketing_campaign_tasks (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  campaign_id uuid NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN ('PRE_RELEASE','RELEASE_DAY','POST_RELEASE','ONGOING')),
  category text NOT NULL CHECK (category IN (
    'CONTENT',
    'DSP',
    'SMART_LINK',
    'SOCIAL',
    'ADS',
    'CREATORS',
    'AUDIENCE',
    'PLAYLIST',
    'OTHER'
  )),
  title text NOT NULL,
  description text NULL,
  status text NOT NULL CHECK (status IN ('TODO','IN_PROGRESS','BLOCKED','DONE','CANCELLED')),
  assignee_user_id uuid NULL REFERENCES users(id) ON DELETE RESTRICT,
  due_at timestamptz NULL,
  completed_at timestamptz NULL,
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX marketing_campaign_tasks_campaign_idx
  ON marketing_campaign_tasks(organization_id, campaign_id, phase, status, due_at, sort_order);

COMMIT;
