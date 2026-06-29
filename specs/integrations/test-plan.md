# Integrations Test Plan

## Documentation Checks

Run:

```bash
rg -n "provider-matrix|Provider Matrix" README.md context integrations specs
rg -n "Auth|Database/BaaS|Analytics|Payment|AI|Email|Storage|SMS|Deploy/CDN" integrations/provider-matrix.md
```

Expected:

- The matrix is reachable from repository docs.
- All required provider classes are present.

## Secret Hygiene Checks

Run:

```bash
rg -n "sk_|service_role|webhook secret|api key|token|password|secret key" README.md context integrations specs .env.example
```

Expected:

- Results are only placeholder/rule text, not real credentials.
- No real secret value, private token, service-role key, webhook secret, or provider payload appears.

## Runtime Regression Smoke

Even documentation-only changes should not hide accidental runtime edits. Start the app and verify:

- `/` loads.
- `/login` loads.
- `/dashboard` keeps the existing protected-route behavior while signed out.
- `/account` keeps the existing protected-route behavior while signed out.

## GNE-180 Verification Log

Record actual command results in the PR body. If a check is not run, explain why.

## GNE-181 Contract And Boundary Checks

Run:

```bash
pnpm typecheck
pnpm lint
rg -n "@supabase/(ssr|supabase-js)|posthog-js" apps/web/app apps/web/components apps/web/lib packages
rg -n "@/lib/providers/server|lib/providers/server|from \"\\.\\/providers\\/server\"|from \"\\.\\.\\/providers\\/server\"" apps/web/app apps/web/components apps/web/lib
rg -n "stripe|paddle|creem|dodo|openai|anthropic|resend|twilio|aliyun|alipay|wechat" packages/core/src apps/web/lib/providers
```

Expected:

- TypeScript and lint checks pass.
- Supabase SDK imports remain in `apps/web/lib/supabase/*`.
- PostHog SDK imports remain in `apps/web/lib/analytics/*`.
- Client components do not import `apps/web/lib/providers/server.ts`.
- Provider contract and adapter files do not introduce real Payment, AI, Email, Storage, or SMS SDKs.

## GNE-182 Environment Checks

Run:

```bash
rg -n "NEXT_PUBLIC_PRODUCT_ID|AUTH_PROVIDER|DATABASE_PROVIDER|NEXT_PUBLIC_ANALYTICS_PROVIDER|PAYMENT_PROVIDER|PAYMENT_MODE|PAYMENT_LIVE_ENABLED|AI_PROVIDER|EMAIL_PROVIDER|STORAGE_PROVIDER|SMS_PROVIDER" .env.example context/environment-matrix.md integrations specs/integrations
rg -n "^NEXT_PUBLIC_.*(SECRET|SERVICE_ROLE|WEBHOOK|PASSWORD)" .env.example context integrations specs
rg -n "^NEXT_PUBLIC_.*(PAYMENT|AI|EMAIL|STORAGE|SMS).*(KEY|SECRET|TOKEN)" .env.example context integrations specs
rg -n 'https://[a-z0-9]{15,30}\.supabase\.co|SUPABASE_PROJECT_REF=[a-z0-9]{15,30}|Project ref: `?[a-z0-9]{15,30}`?' README.md context integrations specs supabase .env.example
rg -n "sk_|sb_secret_|service_role|webhook secret|api key|token|password|secret key" README.md context integrations specs .env.example
```

Expected:

- Provider selectors are documented in `.env.example`, environment matrix, and integration specs.
- No server-only secret variable uses `NEXT_PUBLIC_`.
- `.env.example` does not contain the shared Supabase project ref or URL.
- Secret keyword results are placeholder/rule text only, not real credentials.

## GNE-183 Provider Configuration And Leakage Checks

Run:

```bash
pnpm typecheck
pnpm lint
pnpm build
rg -n "provider-config-checklist|Provider Configuration" README.md integrations specs context apps/web/lib/providers
rg -n "Auth|Database/BaaS|Analytics|Payment|AI|Email|Storage|SMS|Deploy/CDN" integrations/provider-matrix.md integrations/provider-config-checklist.md
rg -n "^NEXT_PUBLIC_.*(SECRET|SERVICE_ROLE|WEBHOOK|PASSWORD)" .env.example context integrations specs apps packages
rg -n "^NEXT_PUBLIC_.*(PAYMENT|AI|EMAIL|STORAGE|SMS).*(KEY|SECRET|TOKEN)" .env.example context integrations specs apps packages
rg -n "NEXT_PUBLIC_ANALYTICS_PROVIDER|AUTH_PROVIDER|DATABASE_PROVIDER|PAYMENT_PROVIDER|PAYMENT_MODE|PAYMENT_LIVE_ENABLED|AI_PROVIDER|EMAIL_PROVIDER|STORAGE_PROVIDER|SMS_PROVIDER" .env.example context/environment-matrix.md integrations specs apps/web/lib/providers
rg -n "@/lib/providers/server|lib/providers/server|from \"\\.\\/providers\\/server\"|from \"\\.\\.\\/providers\\/server\"" apps/web/app apps/web/components apps/web/lib
rg -n "@supabase/(ssr|supabase-js)|posthog-js" apps/web/app apps/web/components apps/web/lib packages
rg -n "stripe|paddle|creem|dodo|openai|anthropic|resend|twilio|aliyun|alipay|wechat" packages/core/src apps/web/lib/providers
rg -n "sk_|sb_secret_|service_role|webhook secret|api key|token|password|secret key" README.md context integrations specs .env.example apps/web/lib/providers
rg -n 'https://[a-z0-9]{15,30}\.supabase\.co|SUPABASE_PROJECT_REF=[a-z0-9]{15,30}|Project ref: `?[a-z0-9]{15,30}`?' README.md context integrations specs supabase .env.example
rg -n "SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|PAYMENT_PROVIDER_SECRET|PAYMENT_SECRET_KEY|PAYMENT_WEBHOOK_SECRET|AI_PROVIDER_API_KEY|EMAIL_PROVIDER_API_KEY|STORAGE_SECRET_ACCESS_KEY|SMS_PROVIDER_API_KEY|SMS_PROVIDER_SECRET" apps/web/.next/static
```

Expected:

- TypeScript, lint, and build pass.
- Checklist is reachable from README, provider matrix, specs, and adapter docs.
- No server-only provider secret is documented as `NEXT_PUBLIC_`.
- Supabase SDK imports remain behind Supabase helpers.
- PostHog SDK imports remain behind analytics helpers.
- Client-facing app code does not import `apps/web/lib/providers/server.ts`.
- Real Payment, AI, Email, Storage, or SMS SDKs are not introduced by GNE-183.
- Secret keyword hits are placeholder/rule/checklist text only.
- `.env.example` does not contain the shared Supabase project ref or API URL.
- Client static build artifacts do not contain server-only secret key names or values.

Runtime smoke:

- Start the app with local ignored env.
- Verify `/`, `/login`, `/dashboard`, and `/account`.
- Confirm signed-out protected routes keep the existing redirect behavior.
- Record whether the in-app browser shows console errors or obvious page breakage.
