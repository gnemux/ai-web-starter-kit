# Auth Product Spec

## Summary

M4 Auth gives the commercial starter kit a reusable account foundation: users can create an account, sign in, sign out, keep a server-validated session, access protected product areas, and maintain a small profile. Supabase Auth is the source of truth for identity and session state. PostHog records safe product analytics events only.

## User

- Primary user: SaaS customer or product operator using the Web app.
- Secondary user: template developer reusing the Auth pattern in a new product.

## Problem

The starter kit currently has data and service examples, but no complete user account flow. Developers need a reference path that shows where Auth logic lives, how protected routes are enforced, how profile rows connect to Supabase Auth users, and how login events are measured without leaking secrets or sensitive fields.

## Goals

- Support email and password sign up, sign in, and sign out through Supabase Auth.
- Protect product routes that require a verified server-side session.
- Read and update `public.user_profiles` through a service boundary.
- Track safe Auth funnel events in PostHog through a local analytics abstraction.
- Keep the Auth flow usable as a template without product-specific copy or provider leakage.
- Render the Auth flow in Chinese by default with an English switch through the shared app i18n layer.

## Non-goals

- OAuth provider setup.
- Password reset, MFA, passkeys, or organization membership.
- Production email template customization.
- Server-side PostHog feature flag bootstrapping.

## User Journey

```text
landing page
-> create account or sign in
-> Supabase validates credentials and sets cookies
-> protected dashboard loads user data through services
-> user updates profile on account page
-> user signs out and returns to login
```

## Requirements

- `GET /login` exposes sign in and sign up modes.
- Auth forms validate email and password before calling Supabase.
- Successful Auth redirects to the requested protected path or `/dashboard`.
- `/dashboard` and `/account` require a Supabase session validated with `getClaims()`.
- Account page shows the current email and profile display name.
- Profile updates write only the signed-in user's own `user_profiles` row.
- PostHog events are captured for submitted, succeeded, failed, logout, and profile update events.
- Login, signup, account, and logout UI labels must read from the shared i18n dictionary instead of route-local hardcoded copy.

## Edge States

- Empty: profile display name can be blank and falls back to email.
- Loading: forms expose pending submit states through server action status.
- Error: validation and provider errors render safe messages.
- Permission denied: unauthenticated protected routes redirect to `/login`.
- Long content: display names are bounded and truncated in shell surfaces.

## Success Metrics

- Activation: `auth_signup_succeeded`.
- Retention: repeat authenticated dashboard access.
- Conversion: later billing events can join against identified users.
- Quality: low `auth_login_failed` rate after deployment configuration is complete.
