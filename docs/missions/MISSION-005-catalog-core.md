# MISSION-005 — Catalog Core

Status: Foundation Implemented

## Rules
- Release, Track, Recording, and Asset are distinct concepts.
- A Release owns presentation and lifecycle state.
- A Recording represents the underlying sound recording identity.
- A Track places a Recording inside a Release with sequence and release-specific presentation.
- Assets are intentionally deferred to MISSION-007.
- Release mutations become versioned as the lifecycle advances. Approved and delivered state must never rely on unrestricted last-write-wins mutation.

## Implemented foundation
- Release aggregate root with canonical lifecycle states.
- Recording and Track domain models.
- Catalog repository boundary and draft-release use case.
- PostgreSQL persistence model for releases, immutable release-version snapshots, recordings, tracks, and release artist credits.
- Tenant ownership is explicit on releases and recordings.
