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
