# ADR-004: Independent Products with Explicit Integration

Status: Accepted

## Decision
Distribution, Lander Creators, and Music OS 360 are independent products with separate accounts, organizations, commercial models, domain ownership, persistence, and roadmaps. Integration uses formal contracts and explicit authorization.

Distribution may provide a focused Lander Creators experience under Marketing. It may support account connection, package discovery, release-context sharing, checkout initiation, campaign status, relevant approvals, deliverables, and results. It does not embed the complete Lander Creators product.

Lander Creators remains source of truth for campaign, creator, deliverable, order, payment, and campaign performance. Distribution remains source of truth for releases and catalog.

## Payment flow
A Creators purchase initiated from Distribution is paid through a Creators-controlled checkout. Browser return is UX only. Activation depends on authenticated server-to-server confirmation through signed webhook and/or authoritative status reconciliation.

## Availability
Failure of Lander Creators cannot block core catalog, QC, distribution, royalty, or payout operations.
