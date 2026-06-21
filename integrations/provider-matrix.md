# Provider Matrix

## Purpose

This matrix is the MVP2 source of truth for provider choices, stage boundaries, mock/no-op/sandbox behavior, and public/server-only configuration rules.

Use it before implementing Billing, Payment, AI, Analytics, Email, Storage, SMS, Auth, Database, or deployment-related provider work.

## Stage Boundary

- MVP2 defines provider matrix, env naming, public/secret rules, provider interface conventions, and mock/no-op/sandbox behavior.
- MVP3 consumes these foundations in the Product Validation Kit and can use sandbox/mock/no-op paths for product validation.
- MVP4 owns real overseas/china dual-mode provider rollout.

## Matrix

| Capability | Current state | Overseas default or candidate | China candidate or reservation | Local/test strategy | MVP2 action | MVP4 action | Server-only boundary | `NEXT_PUBLIC_` rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Auth | Real provider: Supabase Auth. | Supabase Auth. | Reserved for MVP4; China-compatible Auth decision not made. | Local or staging Supabase through env. | Keep existing Supabase helper boundary; do not deep-providerize in `GNE-180`. | Decide real China-compatible Auth path if needed. | Server helpers may use server-only Supabase secrets; normal Auth uses public publishable/anon key. | Allowed only for Supabase public URL and publishable/anon key. |
| Database/BaaS | Real provider: Supabase Postgres with RLS. | Supabase Postgres/BaaS. | Reserved for MVP4; China-compatible database/BaaS decision not made. | Local Supabase plus reviewed migrations. | Keep schema/RLS work under Supabase workflow. | Decide China deployment/data residency strategy. | Service-role and secret keys are server-only. | Allowed only for public Supabase URL and publishable/anon key. |
| Analytics | Real provider: PostHog with no-op fallback when public env is missing. | PostHog. | Jiguang is reserved as China-friendly analytics candidate. | Local may be disabled or use `env=local`; production proof must use deployed URL. | Keep local analytics abstraction and shared properties. | Implement real dual analytics mode if China rollout needs it. | Analytics must not receive passwords, tokens, payment payloads, prompts, or secrets. | Allowed for public analytics key/host/app metadata only. |
| Payment | Planned for MVP2; no real provider integrated. | First real provider decision later among candidates documented in `integrations/payment.md`. | WeChat Pay and Alipay belong to MVP4, not MVP2. | Sandbox Provider first. | Define provider contract and sandbox path in Payment issues after GNE-167. | Implement real overseas/china payment providers, callbacks, refunds, reconciliation, and compliance. | Provider secrets and webhook secrets are server-only. | Not allowed for payment secrets or webhook secrets. Public checkout config requires explicit later approval. |
| AI | Planned for MVP2; no real model provider integrated. | Real provider decision belongs to AI execution issues. | Domestic model provider rollout belongs to MVP4. | Mock/no-op until AI service and provider adapter are implemented. | Define server-only AI service boundary and provider adapter shape later. | Implement domestic/overseas model providers, budgets, fallback, auditing, and deployment differences. | Model API keys, budgets, provider payloads, prompts, and generated sensitive content stay server-only or out of logs. | Not allowed for AI provider secrets. Public model labels require explicit later approval. |
| Email | Not configured. | Candidate to be chosen later, for example a transactional email provider or deployment-stack provider. | China-compatible email provider reserved for MVP4. | No-op email adapter until product email task exists. | Document placeholder and no-op expectation. | Select and implement real providers per market. | Email API keys, SMTP credentials, and sender verification secrets are server-only. | Not allowed for email secrets. Public sender labels require explicit later approval. |
| Storage | Not configured. | Candidate to be chosen later, potentially Supabase Storage or object storage attached to the deployment stack. | China-compatible object storage reserved for MVP4. | No-op/mock storage until a product feature needs file storage. | Document placeholder and no-op expectation. | Select real object storage/CDN path per market. | Storage service keys, signed URL secrets, and private bucket credentials are server-only. | Not allowed for storage secrets. Public asset base URLs may be allowed later. |
| SMS | Not configured. | Candidate to be chosen later only if SMS is needed. | China-compatible SMS provider reserved for MVP4. | No-op SMS adapter until a product flow requires SMS. | Document placeholder and no-op expectation. | Select and implement real SMS providers, templates, signatures, and compliance per market. | SMS API keys, signing secrets, and provider payloads are server-only. | Not allowed for SMS secrets. |
| Deploy/CDN | Real provider: Vercel. | Vercel. | China cloud/CDN/deployment provider reserved for MVP4. | Local Next.js dev server; manual Preview when needed. | Keep Vercel environment and deployment memory rules. | Implement China deployment/CDN/compliance route if needed. | Deployment tokens and provider automation credentials are server-only/operator-only. | Allowed only for app public URL/env/product metadata. |

## Current Real Integrations

- Supabase owns Auth and Database/BaaS for MVP1 and current MVP2 planning.
- PostHog owns product analytics for MVP1-MVP3 by default.
- Vercel owns deployment and CDN for the current web app.

## Current Sandbox, Mock, Or No-Op Areas

- Payment starts with a Sandbox Provider in MVP2.
- AI starts with mock/no-op or server-only adapter work in MVP2.
- Email, Storage, and SMS remain no-op placeholders until a product task needs them.

## GNE-181 Adapter Boundary

- Provider-neutral contracts live in `packages/core/src/providers.ts`.
- App-side provider descriptors and sandbox/mock/no-op adapters live in `apps/web/lib/providers`.
- Supabase Auth and Database remain behind `apps/web/lib/services/*` and `apps/web/lib/supabase/*`; they are not deeply providerized in MVP2 foundation work.
- PostHog remains behind `apps/web/lib/analytics/*`; `apps/web/lib/providers/analytics-client.ts` is only a facade for future convention alignment.
- Payment, AI, Email, Storage, and SMS adapters in GNE-181 are contracts only. They do not install real provider SDKs or introduce secrets.

## Required Reading For Provider Work

- Supabase: `integrations/supabase.md`
- Analytics: `integrations/analytics.md`
- Payment: `integrations/payment.md`
- AI: `integrations/ai.md`
- Email: `integrations/email.md`
- Storage: `integrations/storage.md`
- SMS: `integrations/sms.md`
- Deploy/CDN: `integrations/vercel.md`
- Environment matrix: `context/environment-matrix.md`
- Supabase workflow: `context/supabase-workflow.md`

## Security Rules

- Do not commit real secrets, private tokens, service-role keys, webhook secrets, provider keys, private payloads, account screenshots, or customer data.
- Do not place server-only secrets in `NEXT_PUBLIC_` variables.
- Do not paste provider credentials into README, Linear, PR bodies, screenshots, logs, or analytics.
- Business code should call local services or provider adapters, not scatter provider SDK calls through pages and components.
