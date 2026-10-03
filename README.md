# Lander Distribution Platform

Proprietary music distribution and digital operations platform for Independent Artists and Companies/Organizations.

## Product scope

The platform owns the operational lifecycle for catalog, Artist Identity, releases, metadata, rights, representation and authority, protection and authorization, quality control, provider delivery, Content ID/UGC, analytics, royalties, reconciliation, ledger, wallet, payouts, support, risk, and operational audit.

Lander Records may use the platform as a customer organization. Music OS 360 and Lander Creators are independent products and integrate only through explicit contracts. Cross-product database access is prohibited.

## Architecture

- Node.js + TypeScript
- NestJS API and worker
- React + TypeScript + Vite frontend
- PostgreSQL
- Drizzle plus explicit SQL where justified
- REST + OpenAPI
- Zod boundary validation
- Modular Monolith
- Transactional Outbox for critical asynchronous work
- OpenTelemetry-ready observability

Technical/internal language is English. End-user frontend copy is pt-BR initially.

## Repository policy

This repository uses exactly one branch: `main`.

Do not create feature, task, temporary, release, hotfix, experiment, agent, or worktree branches. Reversibility is handled through small commits and `git revert`.

## Current applications

- Root React/Vite frontend: canonical visual baseline while the portal is progressively moved to the final application structure.
- `apps/api`: NestJS HTTP API.
- `apps/worker`: asynchronous worker process.
- `packages/modules`: domain/application modules.
- `packages/database`: schema and migrations.
- `packages/contracts`: integration and API contracts.

## Local frontend

```sh
npm install
npm run dev
```

## API

```sh
cd apps/api
npm install
npm run build
npm run start
```

Required production configuration is validated at process startup. The API uses `/api/v1` as the versioned route prefix and exposes OpenAPI documentation at `/openapi`.

## Worker

```sh
cd apps/worker
npm install
npm run build
npm run start
```

## Preview and production

Initial visual preview is deployed from `main` through GitHub Actions to GitHub Pages. GitHub Pages is frontend-only and is not a backend runtime.

Production hosting target is Hostinger. Vercel is not part of this architecture.

## Delivery sequence

The canonical execution order is defined in `docs/architecture/MISSION_SEQUENCE.md` and runs from MISSION-001 through MISSION-044 without renumbering.
