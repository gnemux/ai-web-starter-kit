# Auth Acceptance

## Functional Checks

- [ ] `/login` supports sign in and sign up modes.
- [ ] Successful sign in redirects to `/dashboard` or the `next` path.
- [ ] Successful sign out clears the session and returns to `/login`.
- [ ] `/dashboard` and `/account` redirect unauthenticated users to `/login`.
- [ ] `/account` reads and updates the signed-in user's profile.
- [ ] Profile update does not allow editing another user's row.
- [ ] Auth events are routed through the local analytics abstraction.
- [x] `/login`, `/account`, sign out, and profile update controls render through the shared Chinese/English dictionary.

## Technical Checks

- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Build passes.
- [ ] No secrets are committed.
- [ ] Supabase Auth uses `getClaims()` for server-side protection.
- [ ] Relevant docs are updated.

## Product Checks

- [ ] The feature matches the product spec.
- [ ] The UI is usable without reading implementation notes.
- [ ] Auth success and failure metrics are defined.
- [ ] Missing provider configuration fails safely.
