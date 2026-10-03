BEGIN;
CREATE TABLE beneficiaries (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  beneficiary_type text NOT NULL CHECK (beneficiary_type IN ('INDIVIDUAL','COMPANY')),
  legal_name text NOT NULL,
  country_code char(2) NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT','VERIFICATION_REQUIRED','ACTIVE','SUSPENDED','CLOSED')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE payout_accounts (
  id uuid PRIMARY KEY,
  beneficiary_id uuid NOT NULL REFERENCES beneficiaries(id) ON DELETE RESTRICT,
  method_type text NOT NULL CHECK (method_type IN ('PIX','PAYPAL','WISE','LOCAL_BANK','INTERNATIONAL_BANK')),
  country_code char(2) NOT NULL,
  currency char(3) NOT NULL,
  provider_code text NULL,
  provider_account_reference text NULL,
  status text NOT NULL CHECK (status IN ('DRAFT','VERIFICATION_REQUIRED','ACTIVE','SUSPENDED','CLOSED')),
  details_encrypted bytea NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX payout_accounts_beneficiary_idx ON payout_accounts(beneficiary_id, status);
COMMIT;
