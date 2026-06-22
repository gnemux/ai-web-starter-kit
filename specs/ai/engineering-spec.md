# Engineering Spec: MVP2 AI Foundation

## Scope

Define the technical boundary for AI Provider, model, token usage, Credit,
quota, entitlement, and cross-module ownership. This document completes the
GNE-149 contract and is the reference for later AI service, provider adapter,
usage, ledger, entitlement gate, review UI, tests, and deployment tasks.

GNE-156 adds the first runtime boundary for this contract: a server-only AI
service and a controlled API route that future workspace AI flows can call.
This does not integrate a real AI provider and does not change the current
Plans or AI Credit UI.

GNE-150 adds the provider adapter and model configuration structure behind that
service boundary. It supports mock/no-op providers and model catalog selection
without requiring pages to know provider details.

## Affected Areas

- `specs/ai/*`
- `integrations/ai.md`
- `packages/core/src/ai.ts`
- `packages/core/src/providers.ts`
- `apps/web/lib/providers/ai-models.ts`
- `apps/web/lib/providers/server.ts`
- `.env.example`
- `apps/web/lib/services/ai.ts`
- `apps/web/app/api/ai/text/route.ts`
- Future runtime locations:
  - `packages/core/src/providers.ts`
  - `packages/core/src/billing.ts`
  - `apps/web/lib/providers/server.ts`
  - `apps/web/lib/services/ai.ts`
  - `apps/web/lib/services/billing.ts`
  - workspace routes under `apps/web/app/dashboard` or a later workspace route

## Architecture

All AI requests must flow through a server-side service boundary:

```text
workspace UI or server action
-> AI service
-> entitlement gate
-> provider adapter
-> usage measurement
-> Credit / quota ledger
-> analytics observation
-> UI result
```

Current MVP2 runtime boundary:

```text
POST /api/ai/text
-> apps/web/lib/services/ai.ts
-> getCurrentAccount()
-> resolveAiTextModelConfig()
-> assertCurrentBillingEntitlement("ai_tokens")
-> createConfiguredAiProvider()
-> AiProvider.generateText()
-> stable AiGenerateTextResponse
```

GNE-152 and GNE-153 connect successful mock output to the existing Billing
ledger tables. Provider usage facts are stored as typed metadata on
`billing_usage_ledger`, and commercial Credit consumption is recorded in
`billing_credit_ledger` with the usage row linked back to the Credit ledger row.

### Ownership Matrix

| Area | Owns | Must not own |
| --- | --- | --- |
| UI/workspace | User input, result display, provider mode label, Credit outcome message | Provider SDK calls, provider keys, final entitlement decisions, Credit ledger writes |
| AI service | Request validation, idempotency, provider/model selection, token-to-Credit conversion, failure classification | Payment checkout, subscription truth, raw client-side provider calls |
| Provider adapter | Provider-specific request/response normalization | Billing decisions, user-facing pricing, analytics truth |
| Billing | Entitlements, quota decisions, Credit grants, Credit consumption, remaining balance | Provider SDK calls, raw prompt storage |
| Payment | Checkout and trusted payment facts | AI usage measurement, direct AI entitlement decisions |
| Analytics | High-level observation events | Secrets, raw prompts, generated private output, entitlement source of truth |

## Concept Contract

- Provider: a configured implementation behind a provider-neutral interface.
  MVP2 allows mock/no-op behavior before real provider setup.
- Model: a server-selected label with capability, provider, and cost policy.
  Pages may display the selected label but may not choose provider secrets.
- Capability: a stable action family such as `generate_text`, `chat`,
  `completion`, `embedding`, or `moderation`.
- Token: provider-side measurement returned by an adapter when available. Token
  values are internal technical facts.
- Usage: an AI request outcome. It should include request identity, owner,
  provider, model, capability, status, token counts when available, Credit cost,
  and timing/error classification.
- Credit: the commercial unit shown to users. Credit can come from plan
  allowance, Credit pack grants, trials, or manual grants.
- Quota: the currently usable allowance for a feature or model tier.
- Entitlement: the server-side access decision for capability, model tier, and
  required Credit.
- Ledger: append-only Billing records for grant, consume, release, refund,
  expire, and adjustment events.

## Data Model

Current foundations:

- Provider-neutral AI types already exist in `packages/core/src/providers.ts`:
  `AiProvider`, text, chat, embedding, moderation, usage, and error mapping
  contracts.
- AI service request and response contracts live in `packages/core/src/ai.ts`.
- AI model config, model resolution, and preflight Credit estimates live in
  `packages/core/src/ai.ts` and `apps/web/lib/providers/ai-models.ts`.
- Billing Credit and usage types already exist in `packages/core/src/billing.ts`.
- Billing fact tables already include entitlement, usage ledger, and Credit
  ledger concepts.

Later AI data work should keep two layers distinct:

1. Provider usage fact: provider, model, capability, request id, token counts,
   status, latency, error category, and idempotency key.
2. Commercial ledger fact: Credit grant, reservation, consumption, release,
   refund, expiration, or adjustment owned by Billing.

The provider usage fact may be a dedicated AI usage table or a typed metadata
extension around Billing usage. The chosen implementation must not store raw
prompts, generated private output, provider secrets, or full provider payloads.

## Token To Credit Policy

- Product UI displays Credit only.
- Provider token counts may be zero or unavailable in mock/no-op mode.
- Real providers may report input, output, cached, reasoning, or embedding token
  counts differently; the adapter normalizes what it can without leaking
  provider-specific fields into UI.
- AI service converts normalized usage into Credit using server-side model and
  capability configuration.
- Credit deduction happens only after the entitlement gate and only according to
  an explicit success/failure/idempotency rule.

## Request And State Contract

Later AI service implementations should classify outcomes into stable states:

- `allowed`: entitlement and quota passed.
- `unauthenticated`: no signed-in user.
- `entitlement_missing`: user plan or feature access does not allow the
  requested capability or model tier.
- `quota_exhausted`: available Credit or period quota is insufficient.
- `model_unavailable`: requested model is not configured or not available in the
  current market/provider mode.
- `provider_unconfigured`: required provider configuration is missing.
- `budget_limited`: request is blocked by an operator budget cap.
- `provider_failed`: provider returned an error after a valid call.
- `timeout`: provider or service did not complete within the allowed window.
- `duplicate`: idempotency detected a repeated request.

Blocked requests must stop before provider calls and before Credit consumption.
Failed, timed-out, and duplicated requests need explicit ledger handling and
must never silently double-deduct Credit.

GNE-156 implementation details:

- `normalizeAiGenerateTextInput()` validates the controlled request boundary.
- `generateAiTextFromJson()` is the API-facing entry point.
- `generateAiText()` is the server-only service entry point for future server
  actions or route handlers.
- `createAiServiceIdempotencyKey()` creates a stable key shape for later ledger
  and retry handling.
- The current service checks Billing entitlement before provider invocation.
- The current service does not write usage or Credit facts; it returns explicit
  deferred status until the data and ledger issues implement that behavior.

GNE-150 implementation details:

- `AiProvider` now reserves text, chat, embedding, moderation, provider usage,
  finish reason, and provider error mapping shapes.
- `AiModelConfig` defines provider, provider model id, capabilities, cost
  profile, default/fallback behavior, and enabled state.
- `apps/web/lib/providers/ai-models.ts` owns the server-only model catalog.
- `createConfiguredAiProvider()` selects mock or no-op adapter from model config.
- AI service resolves model config before entitlement preflight and provider
  invocation.
- Real model SDKs, real provider keys, and live provider-specific behavior remain
  out of scope.

GNE-152/GNE-153 implementation details:

- Successful workspace text generation writes a `consume` event to
  `billing_credit_ledger` through the Billing service boundary.
- The matching `billing_usage_ledger` row records committed AI Credit usage and
  links to the Credit ledger row through `related_credit_ledger_id`.
- Provider usage measurement is kept in metadata: provider, mode, model,
  provider request id, finish reason, token counts when available, requested
  Credit, request id, purpose, and capability.
- Raw prompts, generated output, provider payloads, and secrets are not written
  to the ledgers.
- Zero-Credit no-op models do not write ledger rows because the existing Billing
  ledger requires positive usage units and non-zero Credit ledger amounts.

GNE-154 implementation details:

- `AiModelConfig.access` declares the Billing feature and optional minimum plan
  required for each model.
- `assertAiModelAccess()` evaluates model access from the Billing snapshot
  before provider adapter creation and before Credit consumption.
- The workspace AI form can choose among the configured text models. This is a
  product-facing model choice, not provider SDK access from the page.
- The standard draft model is available to the existing AI Credit gate.
- The premium draft model requires `pro` plan access before provider invocation.
- The reserved model is selectable for reviewer validation but returns
  `provider_unconfigured` until a real provider is wired in a later task.
- Blocked model access, unavailable model, and unconfigured provider states all
  return explicit service reasons and do not write committed usage or Credit
  ledger rows.

GNE-155 implementation details:

- AI key safety is enforced by keeping provider selection and model config
  server-only, leaving `AI_PROVIDER_API_KEY` empty in `.env.example`, and
  checking source files for browser-visible AI key variables or real provider SDK
  imports.
- `commitAiCreditUsage()` uses insert-first ledger writes instead of
  upsert-overwrite behavior. The database unique `idempotency_key` constraints
  remain the final guard, while service code turns duplicate key conflicts into
  a `deduplicated` result with `0 Credit` consumed.
- `findCommittedAiCreditUsage()` lets the AI service block a repeated
  idempotency key before provider invocation when a committed usage row already
  exists.
- A concurrent duplicate that reaches commit time still returns the stable
  `duplicate` state and `0 Credit` for that retry.
- The AI service emits safe server-side analytics events:
  `ai_request_started`, `ai_request_completed`, `ai_request_failed`, and
  `quota_limit_reached`. These events include provider mode, model, reason,
  Credit amounts, and record status, but never raw prompts, generated text,
  provider payloads, or secrets.
- `scripts/verify-ai-safety.mjs` is the local repeatable check for key exposure,
  metadata safety, ledger idempotency constraints, duplicate handling, and AI
  analytics event coverage.

GNE-160 implementation details:

- Provider secrets remain server-only. MVP2 does not introduce a real provider
  SDK or real provider key; `AI_PROVIDER_API_KEY` stays empty in `.env.example`.
- `AI_BUDGET_LIMIT` is a server-only single-request Credit cap for deploy
  readiness. Empty means no operator cap is applied for mock/no-op local work.
  Invalid or negative values fail closed as `0 Credit`.
- The AI service checks the budget cap after duplicate detection and before
  Billing entitlement checks, provider creation, provider calls, or Credit
  ledger writes. A blocked request returns `budget_limited`, consumes `0 Credit`,
  and emits only a safe `ai_request_failed` summary event.
- The budget cap is an operator guardrail, not the user's commercial balance.
  User-facing Credit availability still comes from Billing entitlement and
  ledger facts.
- Production smoke for a real provider remains a deployment-time checklist:
  configure server-only env entries in Vercel, redeploy, sign in, run one
  low-cost workspace AI request, confirm usage/Credit/analytics facts, and
  record evidence without secrets. This repository step defines the checklist;
  it does not claim that production smoke has passed.

## UI States

- Default: workspace AI action accepts product-specific input and shows provider
  mode, model label, gate status, result, and Credit outcome.
- Empty: no AI history or no prior requests.
- Loading: server-side AI service request in progress.
- Error: provider unavailable, timeout, or service validation failure.
- Permission: login required, entitlement missing, quota exhausted, or model
  access denied.
- Success: result displayed with a clear Credit outcome and link to AI Credit
  records when relevant.

The existing account AI page remains the Credit account surface. It should not
become the primary sample AI input page. A sample AI capability should live in a
workspace surface and link users to Plans or AI Credit top-up only when blocked.

## External Providers

MVP2 starts with provider-neutral interfaces and mock/no-op behavior:

```text
AI_PROVIDER=mock
AI_MODEL=mock-text
AI_PROVIDER_API_KEY=
AI_BUDGET_LIMIT=
```

- `AI_PROVIDER` and `AI_MODEL` are server-side selectors.
- `AI_PROVIDER=noop` selects the no-op text model by default when `AI_MODEL` is
  unset.
- `AI_PROVIDER_API_KEY` and budget variables are server-only.
- No AI provider secret may use `NEXT_PUBLIC_`.
- Overseas/china provider differences are recorded as future extension points.
  MVP2 should not hard-code one provider family into product logic.

## Security

- Secrets: never expose provider keys in browser code, docs, logs, Linear,
  analytics, screenshots, or PR text.
- Permissions: every AI request must be tied to an authenticated owner before
  entitlement or usage records are written.
- User data: do not record raw prompts, generated private output, provider
  payloads, or customer secrets in analytics or durable debug logs.
- Abuse cases: enforce quota, model access, budget limits, idempotency, and
  duplicate handling before enabling real provider calls.

## Rollout

- Local: complete docs first, then add a mock/no-op AI service path.
- Preview: use server-only env placeholders and mock/no-op provider mode unless
  a later issue explicitly enables test-mode real provider checks.
- Production: real provider calls require provider secrets, budget caps,
  no-secret verification, failure-state checks, and smoke evidence under
  dedicated deploy tasks.

## Open Questions

- Whether the provider usage fact should be a dedicated `ai_usage_events` table
  or a typed metadata layer linked to `billing_usage_ledger`.
- Whether model access should be expressed as Billing feature keys, model tier
  entitlements, or both.
- Which real provider families should be selected for overseas and China routes
  in MVP4.
