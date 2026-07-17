# Vercel Integration

## Purpose

Vercel is the default deployment target for preview and production Web deployments.

## Status

Configured for `main`-only automatic deployments. Vercel Functions are pinned
to `sin1` so server-side runtime calls stay close to the current Supabase
project region, `ap-southeast-1`.

## Initial Scope

- Production deployment from `main`.
- Pull request verification through GitHub CI and local or maintainer-run preview checks while the project uses a Vercel Hobby account with a private repository.
- Optional maintainer-run Preview deployments when a shared URL is required.
- Environment variable management.
- Deployment checklist.
- Smoke test after deployment.

## Environment Variables

Use Vercel project environment variables for values listed in `.env.example`.

Production and Preview entries should be configured separately in the Vercel Dashboard. They may temporarily contain the same provider values while the project only has one service environment, but they should remain separate entries so they can diverge later.

After any Vercel environment variable change, redeploy the affected Preview or Production deployment before verifying runtime behavior. Existing deployments do not automatically receive new env values.

Provider selector keys from GNE-182:

```text
AUTH_PROVIDER=supabase
DATABASE_PROVIDER=supabase
NEXT_PUBLIC_ANALYTICS_PROVIDER=posthog
PAYMENT_PROVIDER=sandbox
PAYMENT_MODE=sandbox
PAYMENT_LIVE_ENABLED=false
AI_PROVIDER=mock
EMAIL_PROVIDER=noop
STORAGE_PROVIDER=noop
SMS_PROVIDER=noop
```

Only `NEXT_PUBLIC_ANALYTICS_PROVIDER` is browser-visible. Payment, AI, Email, Storage, SMS, webhook, service-role, SMTP, signing, and private provider API key values must remain server-only and must not use `NEXT_PUBLIC_`.

Public product/environment metadata includes `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_PRODUCT_ID`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_APP_MARKET`, `NEXT_PUBLIC_APP_VERSION`, and `NEXT_PUBLIC_MVP_STAGE`.

## Current MVP2 Production Configuration Checklist

For the current production URL `https://ai-web-starter-kit-web.vercel.app`, Vercel Production should be configured as follows before release verification:

Required Function region:

```json
{
  "regions": ["sin1"]
}
```

Keep this setting mirrored in `/vercel.json` and `/apps/web/vercel.json` while
the Vercel Project Root Directory may be either the repository root or
`apps/web`. The next Production deployment must be checked in Vercel before
treating the region change as live.

Required public app metadata:

```text
NEXT_PUBLIC_APP_NAME=XWLC
NEXT_PUBLIC_PRODUCT_ID=xwlc
NEXT_PUBLIC_APP_URL=https://ai-web-starter-kit-web.vercel.app
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_MARKET=overseas
NEXT_PUBLIC_APP_VERSION=v0.1
NEXT_PUBLIC_MVP_STAGE=mvp2
```

Required provider selectors:

```text
AUTH_PROVIDER=supabase
DATABASE_PROVIDER=supabase
NEXT_PUBLIC_ANALYTICS_PROVIDER=posthog
PAYMENT_PROVIDER=sandbox
PAYMENT_MODE=sandbox
PAYMENT_LIVE_ENABLED=false
AI_PROVIDER=mock
EMAIL_PROVIDER=noop
STORAGE_PROVIDER=noop
SMS_PROVIDER=noop
```

Required Supabase keys:

```text
SUPABASE_PROJECT_REF=<target project ref>
NEXT_PUBLIC_SUPABASE_URL=<target Supabase API URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<public browser key, preferred>
# or NEXT_PUBLIC_SUPABASE_ANON_KEY=<legacy public browser key>
SUPABASE_SECRET_KEY=<server-only key>
# or SUPABASE_SERVICE_ROLE_KEY=<legacy server-only fallback>
```

Required analytics keys when production analytics evidence is needed:

```text
NEXT_PUBLIC_POSTHOG_KEY=<public PostHog key>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Payment for MVP2 production should stay sandbox unless the operator is intentionally replaying the completed `GNE-100` Creem test-mode verification. Do not configure live payment:

```text
PAYMENT_PROVIDER=sandbox
PAYMENT_MODE=sandbox
PAYMENT_LIVE_ENABLED=false
PAYMENT_PROVIDER_SECRET=
PAYMENT_WEBHOOK_SECRET=
```

If a controlled Creem test-mode verification is intentionally run against the deployed URL, switch only for that verification window and keep live payment disabled:

```text
PAYMENT_PROVIDER=creem
PAYMENT_MODE=test
PAYMENT_LIVE_ENABLED=false
PAYMENT_PROVIDER_SECRET=<Creem test API key, server-only>
PAYMENT_WEBHOOK_SECRET=<Creem webhook signing secret, server-only>
CREEM_PLUS_MONTHLY_PRODUCT_ID=<test product id>
CREEM_PRO_MONTHLY_PRODUCT_ID=<test product id>
CREEM_AI_CREDIT_PACK_100K_PRODUCT_ID=<test product id>
CREEM_CHECKOUT_SUCCESS_URL=https://ai-web-starter-kit-web.vercel.app/account/payment/result?status=success
```

Do not configure `PAYMENT_LIVE_ENABLED=true` for MVP2 or MVP3. Live payment, refunds, proration, invoices, settlement, reconciliation, disputes, taxes, KYC, and real-customer charges remain under `GNE-201`.

After changing any Vercel environment variable, redeploy the affected Production or Preview deployment before testing it. Existing deployments keep the old environment values.

Operational memory:

- Deployment status and smoke test writeback: `context/deployment-status.md`
- Production monitoring checklist: `context/production-monitoring.md`
- Environment and product matrix: `context/environment-matrix.md`
- AI automation rules: `specs/deploy/engineering-spec.md`

Provider matrix:

- MVP2 provider stage boundaries and Deploy/CDN provider notes live in `integrations/provider-matrix.md`.

## Rules

- `vercel.json` disables automatic Git deployments for all non-`main` branches to avoid blocked collaborator Preview deployments on the current Hobby/private-repo setup.
- The deployment gating config is mirrored in `/vercel.json` and `/apps/web/vercel.json` so it applies whether the Vercel Project Root Directory is the repository root or `apps/web`.
- On the current Hobby/private-repo setup, Vercel validates the deployment commit author, not only the GitHub user who clicked merge.
- Non-owner collaborator PRs should be merged with `Create a merge commit` by default so the latest `main` deployment commit is owner-authored.
- `Squash and merge` should not be the default for non-owner collaborator PRs because the squash commit may remain contributor-authored and block Production.
- Build must pass before production deployment.
- Pull request feature verification should use GitHub CI and local testing by default.
- Preview deployment may be generated manually by the Vercel project owner when a reviewer needs a shared URL.
- Manual Preview deployments should be recorded with Preview URL, commit, trigger, verification result, and next action in `context/deployment-status.md`.
- If a `main` deployment is blocked by Hobby commit-author checks after merging a contributor PR, the Vercel project owner should redeploy `main` manually. If the same contributor-authored commit remains blocked, create an owner-authored no-op trigger commit after confirming the reviewed tree is already merged, or upgrade Vercel collaboration.
- Production verification should cover the main user path, not only static page load.
- Vercel Functions have a 4.5 MB request-body limit. CatCare care evidence must
  preprocess a selected phone original in the browser to at most 3 MB and keep
  the server route's 4 MB hard limit; do not merely raise the route limit and
  create an environment-dependent 413 failure.
- Do not create empty Vercel entries for optional fallback keys. Leave unused optional placeholders empty only in `.env.example`.
