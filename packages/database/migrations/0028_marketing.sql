BEGIN;

CREATE TABLE marketing_smart_links (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  release_id uuid NOT NULL REFERENCES releases(id) ON DELETE RESTRICT,
  slug text NOT NULL,
  title text NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT','ACTIVE','ARCHIVED')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (organization_id, slug)
);

CREATE TABLE marketing_smart_link_destinations (
  id uuid PRIMARY KEY,
  smart_link_id uuid NOT NULL REFERENCES marketing_smart_links(id) ON DELETE CASCADE,
  destination_code text NOT NULL,
  url text NOT NULL,
  position integer NOT NULL CHECK (position > 0),
  created_at timestamptz NOT NULL,
  UNIQUE (smart_link_id, destination_code)
);

CREATE TABLE marketing_campaigns (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  release_id uuid NOT NULL REFERENCES releases(id) ON DELETE RESTRICT,
  campaign_type text NOT NULL CHECK (campaign_type IN ('PRE_SAVE','DSP_PITCH','PROMOTION','PLAYLIST_TRACKING')),
  status text NOT NULL CHECK (status IN ('DRAFT','READY','ACTIVE','PAUSED','COMPLETED','CANCELLED')),
  starts_at timestamptz NULL,
  ends_at timestamptz NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX marketing_campaigns_release_idx ON marketing_campaigns(organization_id, release_id, status);

COMMIT;
