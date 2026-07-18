# Auth Acceptance

## Functional Checks

- [x] `/login` supports sign in and sign up modes.
- [x] Successful sign in redirects to `/dashboard` or the `next` path.
- [x] Successful sign out clears the session and returns to `/login`.
- [x] `/dashboard` and `/account` redirect unauthenticated users to `/login`.
- [x] `/account` reads and updates the signed-in user's profile.
- [x] Profile update does not allow editing another user's row.
- [x] Auth events are routed through the local analytics abstraction.
- [x] `/login`, `/account`, sign out, and profile update controls render through the shared Chinese/English dictionary.

## Technical Checks

- [x] Typecheck passes.
- [x] Lint passes.
- [x] Build passes.
- [x] No secrets are committed.
- [x] Supabase Auth uses `getClaims()` for server-side protection.
- [x] Relevant docs are updated.

## Product Checks

- [x] The feature matches the product spec.
- [x] The UI is usable without reading implementation notes.
- [x] Auth success and failure metrics are defined.
- [x] Missing provider configuration fails safely.

## GNE-321 Google / Apple OAuth Checks

- [x] Google and Apple controls are active, localized, keyboard accessible, mobile-safe, and prevent duplicate starts while pending.
- [ ] Google and Apple new users establish the existing Supabase SSR cookie session and enter the requested allowlisted product context.
- [ ] An existing email/password browser session can switch to Google without the old Auth cookie overriding the Google user; only the current browser session is cleared and different emails stay separate.
- [ ] A verified same-email password identity is linked by Supabase without an unexplained duplicate account; no application-level email-only linking exists.
- [x] Missing social profile name enters profile completion; existing display names are never overwritten at the application boundary.
- [x] External, protocol-relative, and sibling-prefix `next` values fall back to `/catcare`.
- [x] Cancellation, provider refusal, missing/invalid callback values, PKCE failure, and repeated callback have stable localized recovery handling at the application boundary.
- [x] OAuth application logs and Analytics contain no code, provider token, session cookie, raw profile, raw provider error, email, or secret.
- [x] Local password signup/login/recovery, logout, session restoration, `/account`, and protected-route regression checks pass.
- [ ] Unit tests, typecheck, lint, build, independent Auth review, desktop/mobile Chinese/English checks, and real Google/Apple provider smoke pass.
- [ ] Google/Apple credentials exist only in provider/Supabase controls; Apple client-secret rotation ownership is recorded.

Real-provider items remain unchecked because both providers are disabled in the
current shared Supabase test project. GNE-321 must remain In Progress until the
deployed provider checks pass.
