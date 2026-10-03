# MISSION-021 through MISSION-030 — Analytics and Finance Foundations

Status: Foundation Implemented

## Analytics
Analytics observations are separate from royalty accounting. Usage metrics may inform product views but never become financial truth.

## Statements and royalties
Provider statements are ingested, normalized, matched, reconciled, posted, and then closed. Raw source-line identity is preserved. Unmatched revenue is explicit rather than silently discarded.

## Splits
Royalty split application references an immutable split version. Later split edits do not retroactively mutate already-posted accounting without an explicit correction process.

## Ledger and wallet
The accounting source of truth is an append-oriented double-entry ledger. Wallet is a derived projection. Wallet balance is not a bank account and does not imply withdrawable balance.

## Money
Money is represented as exact decimal text in domain contracts and PostgreSQL `numeric` in persistence. Critical financial code must not use JavaScript floating-point numbers for monetary values.

## Beneficiary, compliance, and payouts
Beneficiary is distinct from User and Organization. Payout accounts are beneficiary-owned and method-specific. KYC/KYB and risk/compliance holds gate eligibility. Payout execution is provider-abstracted and country/currency capabilities must be verified against the real payment-provider contract before production enablement.

Closed financial periods and posted ledger history are not rewritten; corrections use adjustments/reversals.
