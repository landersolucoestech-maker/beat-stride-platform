# MISSION-004 — Artist Identity

Status: Foundation Implemented

## Rules
- Artist Identity is the canonical real-world artist/project identity used by Distribution.
- Artist Identity is distinct from User and Organization.
- Artist Association only records a relationship between an organization and an Artist Identity.
- Association does not grant representation or authority.
- Selecting or associating an artist must never grant protection, authorization, rights control, takedown, transfer, or financial authority.
- The customer portal must not expose a global navigable public artist directory. Artist discovery is contextual to workflows such as release creation.

## Implemented foundation
- ArtistIdentity domain model supporting person, duo, group, and project identities.
- ArtistAssociation model with explicit non-authority semantics.
- Repository ports and creation use case.
- PostgreSQL migration for artist identities and organization associations.

Representation, verified authority, claims, disputes, and scope remain owned by later authority missions.
