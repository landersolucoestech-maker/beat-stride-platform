# Engineering Agent Contract

## Repository policy
- This repository is the proprietary music distribution platform.
- BRANCH_POLICY=SINGLE_BRANCH_ONLY.
- Work only on the existing `main` branch.
- Never create feature, task, temporary, release, hotfix, experiment, agent, or worktree branches.
- Before work, verify repository state and current branch. Preserve unrelated user changes.
- Never use destructive reset, clean, force push, or destructive rebase without explicit authorization.
- Prefer atomic commits and `git revert` for reversibility.

## Product invariants
- Greenfield product reconstruction using the existing UI as the canonical initial visual reference.
- The existing rendered visual language must be preserved unless a product requirement requires a new surface.
- Do not infer business architecture from prototype mocks.
- Customer types are Independent Artist and Company/Organization.
- Lander Records may consume this product but does not own its product domain.
- Music OS 360 and Lander Creators are independent products connected only through formal integration contracts.
- No cross-product database access.
- Association is not Representation. Representation is not Authority. Selecting an artist never grants authority.
- PostgreSQL is the transactional source of truth.
- Financial accounting uses a double-entry ledger; wallet balances are projections.

## Language
- All technical/internal language is English: source identifiers, database schema, API contracts, events, jobs, logs, tests, documentation, infrastructure, configuration, and commit messages.
- End-user frontend is pt-BR initially.
- Do not add additional frontend locales now.
- Keep frontend localization-ready and backend contracts locale-independent.

## Architecture
- Backend: Node.js + TypeScript + NestJS.
- Frontend: React + TypeScript + Vite.
- Database: PostgreSQL with Drizzle and explicit SQL where justified.
- Architecture: Modular Monolith.
- API: REST + OpenAPI.
- Runtime boundary validation: Zod.
- Domain and application layers must not depend on NestJS, HTTP, Drizzle, provider SDKs, or frontend code.
- Critical asynchronous work uses a Transactional Outbox.
- Provider capabilities must be verified; never invent provider behavior.
- Do not introduce microservices, Redis, BullMQ, Kafka, Elasticsearch, GraphQL, Nx, Turborepo, Prisma, or TypeORM without demonstrated need.

## Visual contract
- Existing `src` UI is the canonical visual baseline.
- Preserve sidebar, layout composition, typography, spacing, cards, tables, forms, hierarchy, and responsive behavior where demonstrated.
- Architecture changes are not a reason to redesign the UI.
- New functionality must minimally extrapolate the established visual language.
- Accessibility and responsive defects may be corrected without changing the intended appearance.
- Prototype mocks must not survive as fake production state.

## Cross-product integration
- Distribution owns Release.
- Lander Creators owns Creator Campaign.
- Music OS 360 owns Project.
- Lander Creators account connection is managed under `Settings > Integrations`, not as a standalone Marketing module.
- After an account is explicitly connected, Creators may appear as a release-scoped capability inside `Marketing > Start Marketing`; Distribution credentials never become Creators credentials.
- Marketing publication channel connections (Meta, TikTok, YouTube) are managed under `Settings > Integrations`; they are capabilities consumed by release-scoped Marketing, not standalone modules.
- OAuth access/refresh tokens must not be stored as plaintext business-table fields. Persist only secure credential references plus non-secret connection projections.
- Marketing publication planning may exist before a channel is connected, but execution requires an active authorized connection, an available required asset, a configured provider adapter, and critical async execution through the Transactional Outbox.
- Creators checkout and campaign commercial state remain owned by Lander Creators.
- Distribution may store connection state, external references, synchronization checkpoints, and read projections only.
- Payment confirmation must be server-to-server and must not trust browser redirects.
- Lander Creators unavailability must not block core music distribution.

## Definition of done
Every implemented vertical slice must cover, where applicable: product rule, domain model, state/invariants, application use case, persistence, migration, API contract, authorization, audit, events/outbox, frontend integration, pt-BR presentation, loading/empty/error states, observability, unit tests, integration tests, justified E2E/security tests, visual QA, and evidence.
