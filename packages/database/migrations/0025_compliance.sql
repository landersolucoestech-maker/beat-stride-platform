BEGIN;
CREATE TABLE compliance_cases (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  beneficiary_id uuid NULL REFERENCES beneficiaries(id) ON DELETE RESTRICT,
  case_type text NOT NULL CHECK (case_type IN ('KYC','KYB','PAYOUT_REVIEW','RIGHTS_REVIEW')),
  status text NOT NULL CHECK (status IN ('PENDING','IN_REVIEW','ACTION_REQUIRED','APPROVED','REJECTED','EXPIRED')),
  provider_reference text NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX compliance_cases_org_idx ON compliance_cases(organization_id, status);
COMMIT;
