BEGIN;
CREATE TABLE wallet_projections (
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  currency char(3) NOT NULL,
  ledger_balance numeric(38,18) NOT NULL DEFAULT 0,
  held_amount numeric(38,18) NOT NULL DEFAULT 0,
  reserved_amount numeric(38,18) NOT NULL DEFAULT 0,
  payable_amount numeric(38,18) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (organization_id, currency)
);

CREATE TABLE financial_holds (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  currency char(3) NOT NULL,
  amount numeric(38,18) NOT NULL CHECK (amount > 0),
  hold_type text NOT NULL CHECK (hold_type IN ('COMPLIANCE','RISK','DISPUTE','OPERATIONAL')),
  status text NOT NULL CHECK (status IN ('ACTIVE','RELEASED','EXPIRED')),
  reason_code text NOT NULL,
  created_at timestamptz NOT NULL,
  released_at timestamptz NULL
);
COMMIT;
