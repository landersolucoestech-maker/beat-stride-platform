BEGIN;

ALTER TABLE assets
  DROP CONSTRAINT IF EXISTS assets_asset_type_check;

ALTER TABLE assets
  ADD CONSTRAINT assets_asset_type_check
  CHECK (asset_type IN (
    'ARTWORK',
    'AUDIO_MASTER',
    'VIDEO_MASTER',
    'DOCUMENT',
    'OTHER',
    'MARKETING_IMAGE',
    'MARKETING_VIDEO',
    'MARKETING_AUDIO'
  ));

CREATE INDEX marketing_campaign_contents_asset_idx
  ON marketing_campaign_contents(organization_id, asset_id)
  WHERE asset_id IS NOT NULL;

COMMIT;
