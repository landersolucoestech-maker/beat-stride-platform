# MISSION-007 through MISSION-014 — Domain Foundations

Status: Foundation Implemented

This checkpoint establishes the first code-level invariants for Assets, Metadata, Rights, Submission, QC, Representation & Authority, Artist Protection, and Authorization.

## Non-negotiable separations
- Asset storage state is not metadata validity.
- Rights declaration is not Artist Protection.
- Artist Protection is not Content ID / UGC allowlisting.
- Artist Association is not Representation.
- Representation is not Authority.
- Artist selection never grants authority.
- Submission approval is not DSP live status.

## Authority and protection
Authority is modeled as scoped, evidence-backed, time-bounded grants. Artist Protection has a controller organization and explicit controller-transition state. Ending a representation does not implicitly disable protection.

When an Artist Identity is under active proven company authority, a different organization, including the artist's independent organization, cannot independently alter Artist Protection or manage Direct Authorization. Controller transition must be explicit and auditable.

## Time semantics
Release dates are LocalDate values and persist as PostgreSQL `date`. Operational events, validity windows, audits, and lifecycle changes use instants (`timestamptz`).
