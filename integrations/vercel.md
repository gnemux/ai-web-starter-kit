# Vercel Integration

## Purpose

Vercel is the default deployment target for preview and production Web deployments.

## Status

Planned.

## Initial Scope

- Preview deployments for pull requests.
- Production deployment from `main`.
- Environment variable management.
- Deployment checklist.
- Smoke test after deployment.

## Environment Variables

Use Vercel project environment variables for values listed in `.env.example`.

## Rules

- Build must pass before production deployment.
- Preview deployment should be used for feature verification.
- Production verification should cover the main user path, not only static page load.
