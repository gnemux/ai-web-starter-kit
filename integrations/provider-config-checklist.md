# Provider Configuration And Secret Leakage Checklist

## Purpose

Use this checklist for provider-related PRs before reviewer handoff. It turns the GNE-167 provider matrix into repeatable checks for configuration state, mock/no-op behavior, server-only boundaries, browser regressions, and secret leakage.

Run it when a change touches:

- `.env.example`
- `context/environment-matrix.md`
- `integrations/*`
- `apps/web/lib/providers/*`
- provider SDK imports
- provider environment variables
- smoke tests, Preview, Production, or deployment memory

## Current MVP2 Baseline

| Capability | Required for current app? | Current provider mode | Minimum expected behavior |
| --- | --- | --- | --- |
| Auth | Yes for real login flows | Supabase real provider | Missing public Supabase config must fail clearly at the auth boundary, not expose server secrets. |
| Database/BaaS | Yes for protected data flows | Supabase real provider | Server services keep Supabase behind helpers and RLS. Service-role keys never enter browser code. |
| Analytics | Optional for local app load | PostHog real provider with no-op fallback | Missing PostHog public config must not break page load or Auth flows. Browser blockers may stop analytics only. |
| Payment | No real provider required in GNE-167 | Sandbox provider | Sandbox checkout adapter returns a deterministic no-op session. No real payment SDK or webhook secret is required. |
| AI | No real provider required in GNE-167 | Mock provider | Mock adapter returns deterministic text and zero token usage. No real model key is required; `AI_BUDGET_LIMIT` can block high-cost requests before provider creation. |
| Email | No real provider required in GNE-167 | No-op provider | No-op adapter returns a deterministic no-op delivery. No email is sent. |
| Storage | No real provider required in GNE-167 | No-op provider | No-op adapter returns a deterministic no-op upload target. No signed URL or object write is created. |
| SMS | No real provider required in GNE-167 | No-op provider | No-op adapter returns a deterministic no-op delivery. No SMS is sent. |
| Deploy/CDN | Yes for deployed app | Vercel real provider | Production and Preview env entries are separate. Env changes require redeploy before verification. |

## Configuration Failure Modes

| Scenario | Expected result | Reviewer check |
| --- | --- | --- |
| Optional provider is not configured | App keeps running with no-op, mock, or sandbox behavior. | Remove or leave blank optional public analytics keys locally and verify `/`, `/login`, `/dashboard`, and `/account` still behave normally. |
| Required provider config is missing | A clear config/auth/service error appears at the owning boundary. No secret is printed. | Test the affected route or service boundary and inspect terminal/browser output for safe error text only. |
| Provider host is wrong | Provider calls fail without exposing keys, cookies, webhook payloads, prompts, or raw customer data. | Check logs and browser console for safe status/error categories, not raw credentials. |
| Provider is disabled by selector | Code follows the documented no-op, mock, sandbox, or disabled path. | Confirm selector value is documented before use and that business code does not import real SDKs directly. |
| Server-only adapter is imported by client code | Typecheck, build, or static import search must fail or flag it before merge. | Run the server-only import search in this checklist. |
| Browser blocks analytics requests | Product flows still work; only analytics delivery is degraded. | Verify page load and Auth flow behavior separately from analytics network calls. |

## Static Checks

Run from the repository root.

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Provider matrix and checklist reachability:

```bash
rg -n "provider-config-checklist|Provider Configuration" README.md integrations specs context apps/web/lib/providers
rg -n "Auth|Database/BaaS|Analytics|Payment|AI|Email|Storage|SMS|Deploy/CDN" integrations/provider-matrix.md integrations/provider-config-checklist.md
```

Public/server-only env boundary:

```bash
rg -n "^NEXT_PUBLIC_.*(SECRET|SERVICE_ROLE|WEBHOOK|PASSWORD)" .env.example context integrations specs apps packages
rg -n "^NEXT_PUBLIC_.*(PAYMENT|AI|EMAIL|STORAGE|SMS).*(KEY|SECRET|TOKEN)" .env.example context integrations specs apps packages
rg -n "NEXT_PUBLIC_ANALYTICS_PROVIDER|AUTH_PROVIDER|DATABASE_PROVIDER|PAYMENT_PROVIDER|PAYMENT_MODE|PAYMENT_LIVE_ENABLED|AI_PROVIDER|EMAIL_PROVIDER|STORAGE_PROVIDER|SMS_PROVIDER" .env.example context/environment-matrix.md integrations specs apps/web/lib/providers
```

Provider SDK and server-only adapter boundary:

```bash
rg -n "@/lib/providers/server|lib/providers/server|from \"\\.\\/providers\\/server\"|from \"\\.\\.\\/providers\\/server\"" apps/web/app apps/web/components apps/web/lib
rg -n "@supabase/(ssr|supabase-js)|posthog-js" apps/web/app apps/web/components apps/web/lib packages
rg -n "stripe|paddle|creem|dodo|openai|anthropic|resend|twilio|aliyun|alipay|wechat" packages/core/src apps/web/lib/providers
```

Expected results:

- Supabase SDK imports stay in `apps/web/lib/supabase/*`.
- PostHog SDK imports stay in `apps/web/lib/analytics/*`.
- Client components do not import `apps/web/lib/providers/server.ts`.
- Provider contract and adapter files do not introduce real Payment, AI, Email, Storage, or SMS SDKs.

Secret and real-value searches:

```bash
rg -n "sk_|sb_secret_|service_role|webhook secret|api key|token|password|secret key" README.md context integrations specs .env.example apps/web/lib/providers
rg -n 'https://[a-z0-9]{15,30}\.supabase\.co|SUPABASE_PROJECT_REF=[a-z0-9]{15,30}|Project ref: `?[a-z0-9]{15,30}`?' README.md context integrations specs supabase .env.example
```

Expected results:

- Secret keyword hits are placeholder, rule, or checklist text only.
- No repository docs or environment templates contain a real Supabase project ref or API URL.
- No real provider key, webhook secret, service-role key, access token, private provider payload, customer data, or account screenshot is committed.

## Runtime Smoke Checks

Start the local web app with local ignored env:

```bash
set -a
source .env.local
set +a
PORT=3002 corepack pnpm --filter @starter/web dev
```

Open the app in the in-app browser or a local browser:

| Path | Expected signed-out behavior |
| --- | --- |
| `/` | Homepage loads with current brand, header, and footer. |
| `/login` | Login/signup form and language switcher load. |
| `/dashboard` | Keeps the existing protected-route behavior and redirects to login when signed out. |
| `/account` | Keeps the existing protected-route behavior and redirects to login when signed out. |
| `/account/billing` | Keeps the existing protected-route behavior and redirects to login when signed out. |
| `/account/usage` | Keeps the existing protected-route behavior and redirects to login when signed out. |

Record:

- Local URL.
- Paths verified.
- Console errors or absence of obvious page errors.
- Whether protected-route behavior changed.
- Any provider-specific mock path verified by the current PR.

## Minimum Provider Smoke Or Mock Paths

| Capability | Minimum GNE-167 path | What to verify |
| --- | --- | --- |
| Analytics | Browser page load plus existing PostHog no-op fallback. | Missing analytics public key does not break UI; events must not include passwords, tokens, payment payloads, prompts, or provider secrets. |
| Payment | `/account/payment` -> `/account/payment/sandbox` -> `/account/payment/result`, plus `createSandboxPaymentProvider().createCheckoutSession(...)` through the Payment service. | Returns a sandbox checkout session with a local review URL; success/cancel/failure result pages do not require a real SDK, and entitlement changes come only from the protected server action using server-only Supabase admin config. |
| AI | `createMockAiProvider().generateText(...)` through the server AI service, plus the `AI_BUDGET_LIMIT` guard. | Returns deterministic mock text and zero token usage; does not require `AI_PROVIDER_API_KEY`; requests above a configured budget cap return `budget_limited` with `0 Credit`. |
| Email | `createNoopEmailProvider().sendEmail(...)` through a future server test or service call. | Returns `noop`; sends no email and needs no provider key. |
| Storage | `createNoopStorageProvider().createUploadTarget(...)` through a future server test or service call. | Returns `noop`, `method: "noop"`, and `url: null`; creates no signed URL or object. |
| SMS | `createNoopSmsProvider().sendSms(...)` through a future server test or service call. | Returns `noop`; sends no SMS and needs no provider key. |

Future PRs that add real runtime routes or tests should link their exact path here instead of relying on chat-only instructions.

## Secret Leakage Review Scope

Before handoff, inspect these surfaces:

- Git diff and staged changes.
- `.env.example`.
- README, `context/`, `integrations/`, and `specs/`.
- Linear issue comments, PR body, and PR comments.
- Screenshots or recordings attached to PRs or Linear.
- Browser page source and visible runtime config.
- Client bundle/build artifacts, especially `apps/web/.next/static` after `pnpm build`.

Client bundle check after build:

```bash
rg -n "SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|PAYMENT_PROVIDER_SECRET|PAYMENT_SECRET_KEY|PAYMENT_WEBHOOK_SECRET|AI_PROVIDER_API_KEY|EMAIL_PROVIDER_API_KEY|STORAGE_SECRET_ACCESS_KEY|SMS_PROVIDER_API_KEY|SMS_PROVIDER_SECRET" apps/web/.next/static
```

Expected result:

- No matches in client static assets.
- Server build output may contain non-secret environment variable names, but it must not contain secret values.

## Handoff Requirements

Before asking for human verification:

1. Static checks have passed or any not-run check has a specific reason.
2. Local runtime smoke has been run, or the blocker is documented.
3. A read-only reviewer pass has checked this checklist.
4. Any blocking or clear correctness issue found by reviewer pass has been fixed and rechecked.
5. The handoff message states exactly how the human reviewer should verify the current PR.
