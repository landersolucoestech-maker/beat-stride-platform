BEGIN;
CREATE TABLE payouts (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  beneficiary_id uuid NOT NULL REFERENCES beneficiaries(id) ON DELETE RESTRICT,
  payout_account_id uuid NOT NULL REFERENCES payout_accounts(id) ON DELETE RESTRICT,
  amount numeric(38,18) NOT NULL CHECK (amount > 0),
  currency char(3) NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT','ELIGIBILITY_CHECK','INELIGIBLE','COMPLIANCE_HOLD','RISK_HOLD','READY','REQUESTED','PROCESSING','PAID','FAILED','RETURNED','CANCELLED','REVERSED')),
  provider_code text NULL,
  provider_reference text NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX payouts_organization_idx ON payouts(organization_id, status, created_at DESC);
CREATE UNIQUE INDEX payouts_provider_reference_idx ON payouts(provider_code, provider_reference) WHERE provider_reference IS NOT NULL;
COMMIT;
