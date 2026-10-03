BEGIN;

ALTER TABLE release_metadata_versions
  ALTER COLUMN language DROP NOT NULL,
  ALTER COLUMN copyright_line DROP NOT NULL,
  ALTER COLUMN phonographic_copyright_line DROP NOT NULL;

CREATE TABLE release_assets (
  release_id uuid NOT NULL REFERENCES releases(id) ON DELETE RESTRICT,
  release_version integer NOT NULL CHECK (release_version > 0),
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  asset_role text NOT NULL CHECK (asset_role IN ('ARTWORK')),
  created_at timestamptz NOT NULL,
  PRIMARY KEY (release_id, release_version, asset_role)
);

CREATE TABLE recording_assets (
  recording_id uuid NOT NULL REFERENCES recordings(id) ON DELETE RESTRICT,
  recording_version bigint NOT NULL CHECK (recording_version > 0),
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  asset_role text NOT NULL CHECK (asset_role IN ('AUDIO_MASTER')),
  created_at timestamptz NOT NULL,
  PRIMARY KEY (recording_id, recording_version, asset_role)
);

CREATE INDEX release_assets_asset_idx ON release_assets(asset_id);
CREATE INDEX recording_assets_asset_idx ON recording_assets(asset_id);

COMMIT;
