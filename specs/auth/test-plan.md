# Auth Test Plan

## Unit Tests

- Validate email/password normalization in `packages/core`.
- Validate display name normalization in `packages/core`.
- Validate analytics event names and safe properties through TypeScript contracts.
- Validate Google/Apple provider allowlisting, bounded callback codes, configured callback origins, and allowlisted internal returns.
- Validate OAuth start calls the selected provider once and maps raw failures to stable application categories.
- Validate callback exchange creates/reads the existing profile, preserves an existing display name, and requires profile completion when name is absent.

## Integration Tests

- Service returns `unauthorized` without a valid Supabase session.
- Sign in maps validation and provider failures to safe service errors.
- Profile update upserts only the current user's `user_profiles` row.
- OAuth start returns only the Supabase authorize URL; OAuth callback exchanges through the cookie-aware server client and removes callback parameters by redirect.
- Starting Google while an existing password session is present performs one local-only sign-out before provider navigation; a missing session skips sign-out, and a sign-out failure prevents an ambiguous OAuth transition.
- OAuth start/callback responses apply all Supabase cookie mutations and anti-cache headers to the returned response; protected-route refresh/redirect responses preserve the same contract.
- Verified same-email linking is verified against Supabase Auth identities; the app contains no manual link-by-email write.

## Browser / E2E Checks

- Path: `/login`
- Expected result: sign in form renders and invalid values return validation feedback.
- Expected result: the global language switch changes page labels between Chinese and English.
- Expected result: Google and Apple buttons expose provider-specific pending states, cannot double-submit, and failures remain actionable without raw provider detail.

- Path: `/auth/oauth/callback`
- Expected result: valid Google/Apple PKCE callbacks establish a session and redirect to a clean allowlisted path.
- Expected result: cancellation, missing code/provider, invalid provider, expired/repeated code, and external `next` return safely to localized login guidance.

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
- When PostHog env is configured, confirm safe Auth events in PostHog using the test email `<test-operator-email>`.
- Confirm Auth events use `signup_started`, `user_signed_up`, `login_started`, `user_logged_in`, `auth_login_failed`, `user_logged_out`, and `user_profile_updated`.
- Confirm each Auth event includes `app`, `mvp_stage`, `market`, `env`, `version`, and `module=auth`.
- Confirm no event contains passwords, OTPs, magic links, OAuth codes, Supabase tokens, session cookies, or raw provider payloads.
- With real provider configuration, verify Google new/existing/cancel flows and Apple new/existing/cancel flows on the deployed domain.
- Verify an existing verified password account signing in with the same Google/Apple email does not create an unexplained duplicate user.
- Verify an existing QQ/password session can intentionally switch to a different Gmail/Google account, lands as the Gmail Auth user, and does not silently merge the two user IDs.
- Verify Apple/no-name users land in profile completion, save once, and continue to the original allowlisted path.
- Verify provider disable/misconfiguration is recoverable and no secret or raw callback detail appears in page copy, logs, Analytics, PR, or Linear evidence.
- Verify a normal first provider-settings response taking between 1.5 and 3 seconds does not falsely report that social login is unavailable; this timeout applies only to OAuth availability preflight, not other product requests.
- For production verification, confirm the event URL is not localhost and `env=production`.
- 2026-07-17 GNE-321 local checkpoint: 139 web tests, web typecheck,
  template drift, and diff checks passed. Desktop and 390px mobile browser
  checks passed in Chinese and English with no horizontal overflow; malicious
  return paths, cancelled/missing callbacks, and disabled-provider recovery
  returned localized bounded errors without raw provider detail.
- 2026-07-18 provider readiness: Google is enabled in the shared Supabase test
  project and its real callback created the selected Google identity. The first
  existing-session smoke exposed a stale password-session cookie overwrite;
  request-scoped cookie replacement and local-only preflight sign-out are now
  covered by 142 passing Web tests, including a Cookie-level transition test,
  and await a repeat deployed smoke. Apple
  remains disabled, so Apple browser checks remain `not_run`.
- 2026-07-18 local repeat smoke: after preserving existing Supabase redirects
  and adding `http://localhost:3003/**`, an existing password session switched
  through real Google OAuth and returned to `http://localhost:3003/catcare` as
  the selected, distinct Google identity. Apple provider configuration and real
  Apple-account smoke are deferred to the collaborator who owns the required
  Apple Developer account; this is a recorded `not_run`, not a success claim.

## Regression Risks

- Protected route proxy can accidentally block static assets if matcher is too broad.
- Supabase Auth dashboard settings can change sign up behavior.
- Vercel deployments need a fresh redeploy after environment variables are changed.
- OAuth callback allowlists and provider console configuration can drift independently from app code.
- Apple Web OAuth does not provide a dependable full name and its generated client secret expires, so profile completion and six-month rotation checks are mandatory.
