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

- Path: `/`
- Expected result: unauthenticated header shows Login; authenticated header shows an account menu with Dashboard, account settings, and sign out.
- Expected result: choosing sign out from the account menu clears the session and returns to `/`.

- Path: `/account`
- Expected result: authenticated user can see email, update display name, and sign out.
- Expected result: account content is limited to the real profile workflow and does not show unrelated session, profile, or analytics status cards.
- Expected result: profile labels and sign out state follow the selected language.

## Manual Verification

- Run `pnpm typecheck`.
- Run `pnpm build`.
- Run local dev server and inspect `/login`, `/dashboard`, and `/account`.
- 2026-06-19: `corepack pnpm typecheck`, `corepack pnpm lint`, and `corepack pnpm build` passed.
- 2026-06-19: Browser verified `/login` renders localized labels and unauthenticated `/dashboard` redirects to `/login?next=/dashboard`.
- 2026-06-20: `corepack pnpm typecheck` and `corepack pnpm lint` passed after adding Auth-aware landing account menu; browser verified authenticated `/` opens the account menu with Dashboard, account settings, and sign out.
- 2026-06-20: Browser verified authenticated `/account` only shows current email, display-name editing, save action, and no unrelated session/profile/analytics status cards.
- 2026-06-20: Browser verified sign out from the landing account menu clears the account menu, returns to `/`, and shows the Login entry.
- 2026-06-20: `corepack pnpm typecheck` and `corepack pnpm lint` passed after changing sign-out clients to perform a full navigation to `/`; browser verified the account menu logout returns to `/`, re-renders the landing header with Login, and reports no console errors.
- 2026-06-20: Reproduced the protected-page logout race from `/account`, then changed the sign-out server action to redirect to `/` immediately after a successful Supabase sign out so `/dashboard` and `/account` cannot redirect first to `/login?next=...`.
- 2026-06-20: Reproduced the landing login regression where public routes stalled after logout-related Auth changes. Fixed proxy behavior so only protected routes call Supabase `getClaims()`, added bounded public-shell account lookup, restarted the local dev server, and browser verified the landing header Login link navigates to `/login` with no console errors.
- If Supabase Auth email confirmation is enabled, verify that sign up reports a confirmation-pending state instead of assuming an immediate session.
- When PostHog env is configured, confirm safe Auth events in PostHog using the test email `1851884@qq.com`.

## Regression Risks

- Protected route proxy can accidentally block static assets if matcher is too broad.
- Supabase Auth dashboard settings can change sign up behavior.
- Vercel deployments need a fresh redeploy after environment variables are changed.
