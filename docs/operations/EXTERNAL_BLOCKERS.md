# External Blockers Register

Status: Active

These items cannot be completed by repository work alone and must be resolved with real third-party or operational inputs.

## Distribution provider

Required before real delivery is enabled:

- executed commercial/provider agreement;
- API credentials and environment endpoints;
- verified supported DSPs, territories, media types, update/takedown behavior, identifier behavior, delivery limits, and reporting format;
- webhook/event contract or documented polling behavior;
- sandbox/staging capability if offered;
- support/escalation contacts and SLA expectations.

No provider capability is inferred from marketing material or another provider's behavior.

## Payment and payout provider

Required before payouts are enabled:

- selected provider;
- supported countries and currencies;
- settlement model and fees;
- beneficiary/KYC/KYB requirements;
- payout methods and minimum/maximum limits;
- webhook contract and reconciliation identifiers;
- dispute/reversal behavior;
- credentials for non-production and production environments.

## Compliance

Required before enabling regulated flows:

- approved KYC/KYB policy;
- country-specific payout and tax requirements;
- sanctions/PEP screening obligations where applicable;
- data-retention and deletion requirements;
- privacy/legal review for collected personal and financial data.

## Lander Creators

Required before real Creators checkout/campaign creation is enabled inside Distribution:

- OAuth/delegated authorization contract;
- organization mapping contract;
- package/catalog API;
- pricing and commercial entitlement contract;
- checkout/payment truth contract;
- campaign creation API;
- campaign status/deliverable/metrics projection contract;
- signed webhook contract;
- revocation and reconnect behavior.

Distribution must never store Lander Creators passwords or duplicate the operational Creators source of truth.

## Hostinger production runtime

Required before production deployment:

- selected Hostinger service/runtime shape;
- production domain and DNS control;
- TLS configuration;
- runtime environment/secrets mechanism;
- PostgreSQL connectivity details;
- persistent object storage strategy for media and statement files;
- monitoring/log shipping destination;
- backup policy and restore access.

GitHub Pages remains frontend preview only.
