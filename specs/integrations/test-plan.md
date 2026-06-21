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
rg -n "NEXT_PUBLIC_PRODUCT_ID|AUTH_PROVIDER|DATABASE_PROVIDER|NEXT_PUBLIC_ANALYTICS_PROVIDER|PAYMENT_PROVIDER|AI_PROVIDER|EMAIL_PROVIDER|STORAGE_PROVIDER|SMS_PROVIDER" .env.example context/environment-matrix.md integrations specs/integrations
rg -n "^NEXT_PUBLIC_.*(SECRET|SERVICE_ROLE|WEBHOOK|PASSWORD)" .env.example context integrations specs
rg -n "^NEXT_PUBLIC_.*(PAYMENT|AI|EMAIL|STORAGE|SMS).*(KEY|SECRET|TOKEN)" .env.example context integrations specs
rg -n "nglilxhkuqzswbwitbdu|https://nglilxhkuqzswbwitbdu\\.supabase\\.co" .env.example
rg -n "sk_|sb_secret_|service_role|webhook secret|api key|token|password|secret key" README.md context integrations specs .env.example
```

Expected:

- Provider selectors are documented in `.env.example`, environment matrix, and integration specs.
- No server-only secret variable uses `NEXT_PUBLIC_`.
- `.env.example` does not contain the shared Supabase project ref or URL.
- Secret keyword results are placeholder/rule text only, not real credentials.
