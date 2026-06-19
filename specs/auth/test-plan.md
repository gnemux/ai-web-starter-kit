# Auth Test Plan

## Unit Tests

- Validate email/password normalization in `packages/core`.
- Validate display name normalization in `packages/core`.
- Validate analytics event names and safe properties through TypeScript contracts.

## Integration Tests

- Service returns `unauthorized` without a valid Supabase session.
- Sign in maps validation and provider failures to safe service errors.
- Profile update upserts only the current user's `user_profiles` row.

## Browser / E2E Checks

- Path: `/login`
- Expected result: sign in form renders and invalid values return validation feedback.
- Expected result: the global language switch changes page labels between Chinese and English.

- Path: `/dashboard`
- Expected result: unauthenticated request redirects to `/login?next=%2Fdashboard`.

- Path: `/account`
- Expected result: authenticated user can see email, update display name, and sign out.
- Expected result: profile labels and sign out state follow the selected language.

## Manual Verification

- Run `pnpm typecheck`.
- Run `pnpm build`.
- Run local dev server and inspect `/login`, `/dashboard`, and `/account`.
- 2026-06-19: `corepack pnpm typecheck`, `corepack pnpm lint`, and `corepack pnpm build` passed.
- 2026-06-19: Browser verified `/login` renders localized labels and unauthenticated `/dashboard` redirects to `/login?next=/dashboard`.
- If Supabase Auth email confirmation is enabled, verify that sign up reports a confirmation-pending state instead of assuming an immediate session.
- When PostHog env is configured, confirm safe Auth events in PostHog using the test email `1851884@qq.com`.

## Regression Risks

- Protected route proxy can accidentally block static assets if matcher is too broad.
- Supabase Auth dashboard settings can change sign up behavior.
- Vercel deployments need a fresh redeploy after environment variables are changed.
