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
- `apps/web/lib/supabase/proxy.ts` protects selected routes with `getClaims()` and must not block public routes such as `/` or `/login` on a remote Auth check.
- `apps/web/proxy.ts` connects the Next.js proxy boundary.
- `apps/web/lib/services/auth.ts` owns sign up, sign in, sign out, current user, and profile update use cases.
- `apps/web/lib/services/oauth.ts` owns provider allowlisting, OAuth start/callback normalization, PKCE exchange, and safe provider-error mapping so the existing Auth service does not become a second monolith.
- `/auth/oauth/start` locally signs out an existing browser session before starting Google or Apple through `signInWithOAuth`; `/auth/oauth/callback` exchanges the one-time code for the normal SSR cookie session and immediately removes callback parameters through a clean redirect.
- OAuth Route Handlers create one request-scoped Supabase client, capture every cookie mutation and Supabase-provided anti-cache header, and apply them to the exact JSON/redirect response. Auth clients are never shared across requests, and protected-route proxy responses preserve the same cookie/header contract.
- Auth server actions translate `FormData`, call services, revalidate affected paths, and redirect on successful navigation.
- Client form components call server actions and capture safe PostHog events through `trackEvent`.
- Pages render service results and never import Supabase SDKs directly.
- Auth pages and controls receive localized labels from `apps/web/lib/i18n.ts`; client components accept label props where needed.
- Public landing may call the bounded `getCurrentAccountForPublicShell()` helper to personalize navigation, but it must not redirect unauthenticated visitors or block the public page if Supabase Auth is slow or unavailable. Its account menu must reuse existing Auth server actions for sign out.

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
- Public: landing header shows Login for unauthenticated visitors and a compact account menu for authenticated visitors.
- Empty: account page works when no display name is set.
- Loading: submit buttons show pending labels.
- Error: safe error banners render validation/provider categories.
- Success: profile update returns a success state and refreshes account/dashboard.
- I18n: default Chinese labels, English switch available through the single global language switcher.
- OAuth: provider buttons have visible keyboard focus, provider-specific pending text, disable duplicate starts while redirecting, and keep the existing CatCare login composition on desktop and mobile.
- Profile completion: a successful OAuth callback with no display name redirects to `/account?complete_profile=1&next=<safe>`; saving returns to the allowlisted product path.

## External Providers

Supabase:

- Public client values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Server-only optional values: `SUPABASE_SECRET_KEY` or legacy `SUPABASE_SERVICE_ROLE_KEY`.
- Protected server code must use `supabase.auth.getClaims()` instead of trusting `getSession()`.
- Social sign-in uses Supabase PKCE/SSR helpers. The app requests only the default OpenID/email/profile identity data, never stores provider access/refresh/id tokens, and relies on verified-email automatic identity linking.
- Google Client ID/Secret and Apple Services ID/client secret live only in Supabase/provider configuration. Apple `.p8`, Team ID, and Key ID never enter app environment files or Git.

PostHog:

- Client values: `NEXT_PUBLIC_POSTHOG_KEY` or `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, plus `NEXT_PUBLIC_POSTHOG_HOST`.
- If PostHog env is missing, tracking is a no-op.
- Auth events must include the shared MVP factory properties: `app`, `mvp_stage`, `market`, `env`, `version`, and `module`.
- Auth analytics must not capture passwords, tokens, OTPs, cookies, raw provider payloads, or service keys.

## Security

- Secrets: no Auth or analytics secret is committed.
- Permissions: RLS remains the database enforcement layer for profile and demo rows.
- User data: identify users with stable Auth user id and safe email property only after successful login/sign up.
- Abuse cases: error messages are normalized so provider internals are not exposed.
- Return safety: every OAuth `next` value passes `normalizeInternalReturnTo`; callback provider and code are bounded allowlisted inputs.
- Callback privacy: authorization codes and raw callback errors are never logged, rendered, added to Analytics, or copied into the post-login URL.
- Identity safety: the application does not manually link by unverified email and does not overwrite an existing profile name with provider metadata.
- Session switching: an existing browser session is signed out with `scope=local` before social OAuth starts. This does not revoke other devices, does not link different emails, and prevents a stale password-session cookie from winning after the callback.
- Cache safety: every response that writes or refreshes Auth cookies carries the `@supabase/ssr` anti-cache headers; OAuth routes are forced dynamic.

## Rollout

- Local: run with ignored `.env.local` values and local or staging Supabase.
- Preview: Vercel preview needs Supabase and PostHog public environment variables.
- Production: deployment must be redeployed after environment changes; production schema changes still require reviewed migrations.
- Provider rollout: Google and Apple stay release-blocked until their exact Supabase callback, application origin/Services ID, and real account smoke pass. Apple client-secret rotation is an operational requirement at least every six months.

## Open Questions

- Whether production sign up requires email confirmation depends on Supabase Auth dashboard settings; this implementation supports both immediate session and email-confirmation pending states.
- No schema migration is required for social login; existing `auth.users`, `auth.identities`, and `public.user_profiles` remain the identity/profile boundary.
