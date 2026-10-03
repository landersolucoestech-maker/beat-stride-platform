# Engineering Constitution

## Purpose
This repository evolves the existing visual prototype into a production-grade proprietary music distribution and operations platform while preserving the approved initial visual baseline.

## Product boundary
The platform independently serves Independent Artists and Companies/Organizations. Lander Records is a possible customer. Music OS 360 and Lander Creators are independent products.

## Source of truth
Each product owns its domain and persistence. Distribution owns releases, catalog, distribution operations, royalty accounting, and payout orchestration. Lander Creators owns creator campaigns. Music OS 360 owns its projects. Interoperability uses versioned APIs, signed webhooks, events, and explicit authorization; direct cross-product database access is prohibited.

## Core architecture
The target is a TypeScript modular monolith with NestJS API/worker applications, PostgreSQL, Drizzle, REST/OpenAPI, runtime Zod validation, and React/Vite clients. Domain and application code remain framework-independent.

## Data and finance
PostgreSQL is canonical. Money uses exact decimal semantics plus currency. Release dates use local-date semantics rather than timestamps. Accounting is double-entry and append-oriented. Corrections use adjustment/reversal rather than historical mutation. Wallet is a projection, never the accounting source of truth.

## Authority
Artist association, representation, and authority are distinct. Sensitive operations require current verified authority and scope. Artist Protection controller transitions must not silently disable protection.

## Reliability
Critical asynchronous transitions use a transactional outbox and idempotent consumers. External webhooks are authenticated, replay-protected, deduplicated, and resistant to out-of-order state regression. Unknown external state remains unknown rather than being coerced to failure.

## Security
Tenant isolation is server-side and tested. Secrets never enter frontend bundles, logs, repositories, or AI prompts. Sensitive actions are audited. AI may assist but is not the source of truth for rights, authority, fraud termination, destructive catalog actions, or extraordinary financial decisions.

## Product ecosystem
Integration readiness does not imply immediate implementation. Each product remains usable independently. Cross-product features degrade independently and cannot become mandatory dependencies of core distribution.
