BEGIN;

ALTER TABLE risk_cases
  ADD COLUMN destination_code text NULL,
  ADD COLUMN reason_detail text NULL,
  ADD COLUMN suspicious_usage_count numeric(38,0) NULL CHECK (suspicious_usage_count IS NULL OR suspicious_usage_count >= 0);

CREATE INDEX risk_cases_organization_status_opened_idx
  ON risk_cases(organization_id, status, opened_at DESC);

COMMIT;
