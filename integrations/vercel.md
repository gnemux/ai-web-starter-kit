# Vercel Integration

## Purpose

Vercel is the default deployment target for preview and production Web deployments.

## Status

Configured for `main`-only automatic deployments.

## Initial Scope

- Production deployment from `main`.
- Pull request verification through GitHub CI and local or maintainer-run preview checks while the project uses a Vercel Hobby account with a private repository.
- Optional maintainer-run Preview deployments when a shared URL is required.
- Environment variable management.
- Deployment checklist.
- Smoke test after deployment.

## Environment Variables

Use Vercel project environment variables for values listed in `.env.example`.

Production and Preview entries should be configured separately in the Vercel Dashboard. They may temporarily contain the same provider values while the project only has one service environment, but they should remain separate entries so they can diverge later.

Operational memory:

- Deployment status and smoke test writeback: `context/deployment-status.md`
- Production monitoring checklist: `context/production-monitoring.md`
- Environment and product matrix: `context/environment-matrix.md`
- AI automation rules: `specs/deploy/engineering-spec.md`

## Rules

- `vercel.json` disables automatic Git deployments for all non-`main` branches to avoid blocked collaborator Preview deployments on the current Hobby/private-repo setup.
- The deployment gating config is mirrored in `/vercel.json` and `/apps/web/vercel.json` so it applies whether the Vercel Project Root Directory is the repository root or `apps/web`.
- Build must pass before production deployment.
- Pull request feature verification should use GitHub CI and local testing by default.
- Preview deployment may be generated manually by the Vercel project owner when a reviewer needs a shared URL.
- Manual Preview deployments should be recorded with Preview URL, commit, trigger, verification result, and next action in `context/deployment-status.md`.
- If a `main` deployment is blocked by Hobby commit-author checks after merging a contributor PR, the Vercel project owner should redeploy `main` manually or upgrade Vercel collaboration.
- Production verification should cover the main user path, not only static page load.
