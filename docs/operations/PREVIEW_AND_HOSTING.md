# Preview and Hosting Strategy

## Initial preview
GitHub Actions builds the frontend from the single `main` branch and deploys the static preview to GitHub Pages. This environment exists for visual/product review during development.

## Production hosting
Production hosting is Hostinger. Vercel is not part of the deployment architecture and must not be introduced.

## Branch policy
Preview, CI, staging, and production workflows must use the existing single `main` branch. Environment promotion is based on commits and immutable artifacts, never additional Git branches.

## Scope
The GitHub Pages preview is the frontend review surface. It is not the production backend, database, worker runtime, or a substitute for Hostinger infrastructure.
