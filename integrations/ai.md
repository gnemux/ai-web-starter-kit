# AI Integration

## Purpose

AI integration supports provider-based model calls, provider token measurement, product-facing Credit consumption, quota handling, and entitlement-gated high-cost product features.

## Status

MVP2 AI foundation is complete locally under
`GNE-148 MVP2 AI-00 [AI] AI Provider、Usage、Credit 与 Entitlement 底座`. The
reviewer path is `/dashboard` for AI input/result, `/account/usage` for Credit
balance/top-up/records, and `/account/billing` for plan selection. Real
production AI provider smoke is still `not_run` until a real provider is
configured and a deployed path is verified.

Provider matrix and stage boundaries live in `integrations/provider-matrix.md`.

The GNE-149 boundary contract lives in:

- `specs/ai/product-spec.md`
- `specs/ai/engineering-spec.md`
- `specs/ai/acceptance.md`
- `specs/ai/test-plan.md`

Provider adapter boundary:

- GNE-181 defines provider-neutral AI contract types in `packages/core/src/providers.ts`.
- The MVP2 mock adapter landing point is `apps/web/lib/providers/server.ts`.
- GNE-156 defines the AI service contract in `packages/core/src/ai.ts`, the server-only app service in `apps/web/lib/services/ai.ts`, and the controlled text route in `apps/web/app/api/ai/text/route.ts`.
- GNE-150 adds the server-only model catalog in `apps/web/lib/providers/ai-models.ts`, mock/no-op AI provider factories in `apps/web/lib/providers/server.ts`, and provider/model/cost config types in `packages/core/src/ai.ts` and `packages/core/src/providers.ts`.
- GNE-151 adds the workspace AI draft example in `apps/web/app/dashboard`, using a Server Action that calls the server-only AI service.
- GNE-199 completes the app review surface by pairing the workspace AI workflow
  with the `/account/usage` Credit balance, top-up, recharge-record, and
  consumption-record surface.
- GNE-155 adds repeatable AI safety checks, duplicate Credit-consumption
  protection, and safe server-side AI analytics events.
- GNE-160 adds the server-only `AI_BUDGET_LIMIT` request cap, deploy env
  checklist, and production smoke criteria without adding a real provider SDK or
  provider secret.
- No real model SDK, model provider key, or prompt logging behavior is introduced by GNE-181.

## Strategy

AI calls must go through a server-only service boundary and provider adapter. Pages and client components must not call model provider SDKs directly. Product UI should expose Credit, while the AI service owns conversion between provider/model tokens and Credit.

```text
UI action
-> AI service
-> entitlement gate
-> provider adapter
-> usage record
-> credit / quota ledger
-> analytics observation
```

## MVP Boundaries

- MVP2 defines the AI service contract, provider adapter, model config, usage model, credit/quota ledger, entitlement gate, tests, secrets, budget limits, and smoke test rules.
- MVP3 Product Validation Kit can use mock/no-op or a real provider contract for validation-page copy generation. Real AI provider product acceptance is a conditional follow-up under `MVP3-CP-08`, not a blocker for MVP3 core validation.
- MVP4 owns overseas/china real dual-mode AI provider rollout, including domestic model providers, budget controls, rate limits, fallback behavior, auditing, and deployment differences.

## Reviewer Surface

AI work must expose a page-level path that a teammate can test without reading implementation details:

```text
AI entry
-> prompt or input
-> entitlement / quota gate
-> provider mode
-> mock/no-op or real result
-> usage / credit / quota state
```

The UI must also show blocked and failure states: unauthenticated user, insufficient entitlement, quota exhausted, unavailable model, provider error, timeout, and retry or duplicate handling. Failed calls must not silently deduct credit.

The dedicated Linear task for this surface is
`GNE-199 AI-10 [APP/REVIEW][MVP2]` and is complete in repo. The review path is:

```text
/dashboard
-> AI input
-> model choice
-> server-side gate/provider call
-> mock/no-op result or blocked state
-> Credit outcome
-> /account/usage records
```

UI must follow the app-shell conventions instead of a marketing demo style. Frontend pages call service/API boundaries and never import model SDKs, expose provider secrets, bypass Billing entitlement checks, or log raw prompts/sensitive generated output to Analytics.

## Environment Variables

```text
AI_PROVIDER=mock
AI_MODEL=mock-text
AI_PROVIDER_API_KEY=
AI_BUDGET_LIMIT=
```

`AI_PROVIDER` is a non-secret server-side selector. Use `mock` for deterministic local development and `noop` when the workflow should render without model behavior. `AI_PROVIDER_API_KEY` and budget controls are server-only and must not use `NEXT_PUBLIC_`.

Provider secrets must be server-only. Do not create `NEXT_PUBLIC_` AI provider secret variables.

`AI_BUDGET_LIMIT` is optional and server-only. Leave it empty for mock/no-op
local work; set a numeric single-request Credit cap in Vercel or another
provider dashboard before real provider smoke tests. Invalid or negative values
fail closed as `0 Credit`.

## Rules

- Never expose provider secrets to browser code, logs, Linear comments, docs, screenshots, or PR bodies.
- Do not record raw prompts, generated text, provider payloads, customer secrets, or personal sensitive content in analytics.
- AI usage is a measurement fact; Billing credit/quota ledger is the commercial fact.
- Product UI must not present provider tokens as the user's commercial AI balance; show Credit instead.
- Sample AI input/result workflows should live in workspace or product workflow surfaces. The account AI page remains the Credit balance, top-up, recharge-record, and consumption-record surface.
- Model selection, provider selection, token-to-Credit conversion, idempotency, and Credit deduction belong behind the server-side AI service boundary, not in page components.
- Analytics may observe AI events, but it must not be the source of entitlement, usage, or credit truth.
- Failed, timed-out, retried, or duplicated model calls must have explicit usage and credit handling rules.
- Product code should call a local AI service/provider adapter instead of importing a model SDK in pages or client components.
- Vercel Production and Preview entries must be configured separately. Redeploy after changing AI env keys before verifying model behavior.

## Linear Execution Order

```text
GNE-148 MVP2 AI-00
├── GNE-149 AI-01 [DOC][MVP2] Define AI provider, model, token, credit, and entitlement boundaries (Done in repo)
├── GNE-156 AI-02 [API][MVP2] Define AI service and server-only call boundary (Done in repo)
├── GNE-150 AI-03 [DEV][MVP2] Build AI Provider Adapter and model config (Done in repo)
├── GNE-151 AI-04 [DEV][MVP2] Build AI Service examples: chat, completion, embedding (Done in repo)
├── GNE-152 AI-05 [DATA][MVP2] Build Token Usage measurement model (Done in repo)
├── GNE-153 AI-06 [DEV][MVP2] Build Credit / Quota Ledger and subscription allowance link (Done in repo)
├── GNE-154 AI-07 [DEV][MVP2] Build AI Entitlement Gate and model access limits (Done in repo)
├── GNE-199 AI-10 [APP/REVIEW][MVP2] Build AI demo and quota review page (Done in repo)
├── GNE-155 AI-08 [TEST][MVP2] Verify key safety, token idempotency, and quota boundaries (Done in repo)
└── GNE-160 AI-09 [DEPLOY][MVP2] Provider secrets, budget limits, and production smoke test (Done in repo)
```

GNE-152 and GNE-153 use the existing Billing ledger tables instead of adding a
new Supabase schema. Successful workspace mock text generation records provider
usage measurement as typed `billing_usage_ledger.metadata`, writes a matching
`billing_credit_ledger` `consume` event, links the two rows, and updates the
AI Credit page through the existing Billing activity reader. Raw prompts,
generated text, provider payloads, and secrets are intentionally excluded from
ledger metadata.

GNE-154 adds model-level access policy to the server-side AI model catalog.
The AI service evaluates the selected model against the Billing snapshot before
provider adapter creation and Credit consumption. Workspace users can choose a
configured text model; reserved or inaccessible models return explicit blocked
states and consume `0 Credit`.

GNE-199 treats the reviewer path as a product workflow rather than an account
settings demo. `/dashboard` owns AI input and result review; `/account/usage`
owns available Credit, plan-vs-pack Credit split, credit-pack top-up, recharge
records, and Credit consumption records; `/account/billing` owns Free/Plus/Pro
plan selection.

GNE-155 keeps the implementation safe before real provider work. Duplicate AI
requests with an existing committed idempotency key are blocked before provider
invocation. Concurrent duplicates that race at ledger commit time return
`duplicate` and `0 Credit` for the retry. `scripts/verify-ai-safety.mjs` checks
for key exposure, raw prompt/generated text leakage, idempotency constraints,
duplicate handling, and AI analytics coverage. Server-side AI analytics emits
only safe summary events: `ai_request_started`, `ai_request_completed`,
`ai_request_failed`, and `quota_limit_reached`.

GNE-160 keeps production AI readiness constrained. The AI service enforces
`AI_BUDGET_LIMIT` before provider creation or Credit ledger writes; blocked
requests return `budget_limited`, consume `0 Credit`, and emit only safe summary
analytics. Production smoke requires a deployed, signed-in, low-cost workspace
AI request plus `/account/usage` and analytics verification, but that smoke is
not recorded as passed until it is actually run after provider configuration and
redeploy.
