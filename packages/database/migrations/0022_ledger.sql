BEGIN;
CREATE TABLE ledger_accounts (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  account_code text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')),
  currency char(3) NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (organization_id, account_code, currency)
);

CREATE TABLE ledger_transactions (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  reference_type text NOT NULL,
  reference_id text NOT NULL,
  currency char(3) NOT NULL,
  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (organization_id, reference_type, reference_id)
);

CREATE TABLE ledger_entries (
  id uuid PRIMARY KEY,
  transaction_id uuid NOT NULL REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
  account_id uuid NOT NULL REFERENCES ledger_accounts(id) ON DELETE RESTRICT,
  side text NOT NULL CHECK (side IN ('DEBIT','CREDIT')),
  amount numeric(38,18) NOT NULL CHECK (amount >= 0),
  currency char(3) NOT NULL,
  created_at timestamptz NOT NULL
);
CREATE INDEX ledger_entries_transaction_idx ON ledger_entries(transaction_id);
CREATE INDEX ledger_entries_account_idx ON ledger_entries(account_id, created_at);
COMMIT;
