# Auth Engineering Spec

## Scope

M4 implements Supabase Auth and a profile/account reference flow on top of the M2 data tables and M3 service layer. It also adds a PostHog client-side analytics abstraction for safe Auth funnel tracking.

## Affected Areas

- `apps/web`: Auth routes, protected route proxy, server actions, services, account/dashboard UI, analytics wiring.
- `packages/core`: provider-independent Auth/profile validation and event contracts.
- `integrations`: Supabase and analytics operating notes.
- `specs/auth`: product, engineering, acceptance, and test plan.

## Architecture

- `apps/web/lib/supabase/server.ts` creates cookie-aware Supabase server clients.
- `apps/web/lib/supabase/proxy.ts` refreshes sessions and protects selected routes with `getClaims()`.
- `apps/web/proxy.ts` connects the Next.js proxy boundary.
- `apps/web/lib/services/auth.ts` owns sign up, sign in, sign out, current user, and profile update use cases.
- Auth server actions translate `FormData`, call services, revalidate affected paths, and redirect on successful navigation.
- Client form components call server actions and capture safe PostHog events through `trackEvent`.
- Pages render service results and never import Supabase SDKs directly.

## Data Model

No new migration is required for M4. Existing M2 tables are used:

- `auth.users`: Supabase-managed identity records.
- `public.user_profiles`: one row per Auth user, `id` references `auth.users(id)`.

Validation rules:

- Email must be syntactically valid and 254 characters or fewer.
- Password must be at least 8 characters.
- Display name is optional, 80 characters or fewer.

## UI States

- Default: login page shows sign in by default and can switch to sign up.
- Empty: account page works when no display name is set.
- Loading: submit buttons show pending labels.
- Error: safe error banners render validation/provider categories.
- Success: profile update returns a success state and refreshes account/dashboard.

## External Providers

Supabase:

- Public client values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Server-only optional values: `SUPABASE_SECRET_KEY` or legacy `SUPABASE_SERVICE_ROLE_KEY`.
- Protected server code must use `supabase.auth.getClaims()` instead of trusting `getSession()`.

PostHog:

- Client values: `NEXT_PUBLIC_POSTHOG_KEY` or `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, plus `NEXT_PUBLIC_POSTHOG_HOST`.
- If PostHog env is missing, tracking is a no-op.
- Auth analytics must not capture passwords, tokens, OTPs, cookies, raw provider payloads, or service keys.

## Security

- Secrets: no Auth or analytics secret is committed.
- Permissions: RLS remains the database enforcement layer for profile and demo rows.
- User data: identify users with stable Auth user id and safe email property only after successful login/sign up.
- Abuse cases: error messages are normalized so provider internals are not exposed.

## Rollout

- Local: run with ignored `.env.local` values and local or staging Supabase.
- Preview: Vercel preview needs Supabase and PostHog public environment variables.
- Production: deployment must be redeployed after environment changes; production schema changes still require reviewed migrations.

## Open Questions

- Whether production sign up requires email confirmation depends on Supabase Auth dashboard settings; this implementation supports both immediate session and email-confirmation pending states.
