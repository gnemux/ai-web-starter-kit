# Acceptance: MVP2 AI Foundation

## GNE-149 Boundary Checks

- [ ] Provider, model, capability, token, usage, Credit, quota, entitlement, and
  ledger are defined in `specs/ai/product-spec.md` and
  `specs/ai/engineering-spec.md`.
- [ ] The docs clearly state that users see Credit, not provider tokens.
- [ ] The docs clearly separate provider usage facts from commercial Credit
  ledger facts.
- [ ] The docs define the server-only AI service boundary before any real AI
  provider integration.
- [ ] The docs clarify that sample AI input/result workflows belong in the
  workspace or product workflow, while the account AI page remains the Credit
  account surface.
- [ ] Failure and blocked states include unauthenticated, entitlement missing,
  quota exhausted, model unavailable, provider unconfigured, budget limited,
  provider failure, timeout, and duplicate request handling.
- [ ] Billing, Payment, AI, and Analytics responsibilities are separated.

## Functional Checks

- [ ] Existing Plans and AI Credit pages are not changed by GNE-149.
- [ ] Later AI sub-issues can cite this spec as their shared boundary.
- [ ] No provider key, model selection, token conversion, or Credit deduction
  rule is assigned to page components.

## GNE-156 Service Boundary Checks

- [ ] AI request/response types are exported from `packages/core/src/ai.ts`.
- [ ] Server-only AI service entry points exist in `apps/web/lib/services/ai.ts`.
- [ ] A controlled API route exists at `apps/web/app/api/ai/text/route.ts`.
- [ ] The API route calls the AI service and does not import a provider SDK.
- [ ] The AI service checks the current account and Billing entitlement before
  invoking the provider adapter.
- [ ] Successful mock calls return provider mode, model, result, gate state, and
  explicit deferred usage/Credit status.
- [ ] Blocked calls do not invoke the provider adapter and do not consume Credit.
- [ ] Real provider keys are not introduced and no `NEXT_PUBLIC_` AI secret is
  added.

## GNE-150 Provider Adapter And Model Config Checks

- [ ] AI provider contracts reserve text, chat, embedding, moderation, usage,
  finish reason, and error mapping shapes in `packages/core/src/providers.ts`.
- [ ] AI model config defines provider, provider model id, capabilities, cost
  profile, default/fallback behavior, and enabled state.
- [ ] Server-only model catalog exists in `apps/web/lib/providers/ai-models.ts`.
- [ ] Server provider factory can create mock and no-op AI providers without real
  provider keys.
- [ ] AI service resolves model config before entitlement preflight and provider
  invocation.
- [ ] Adding a future real provider should require provider/model/service wiring,
  not page-level changes.
- [ ] `.env.example` documents mock/no-op AI provider mode without adding real
  secrets.

## GNE-151 Service Example Checks

- [ ] Workspace includes an AI input/result workflow that calls the AI service
  through a Server Action.
- [ ] The workflow runs locally without a real provider key through mock/no-op
  provider behavior.
- [ ] The page shows provider mode, model, entitlement gate result, mock/no-op
  result, estimated Credit, deducted Credit, and record state.
- [ ] The page does not import a provider SDK, expose provider secrets, or place
  model/Credit logic in the component.
- [ ] The result path returns explicit deferred record status until GNE-152 and
  GNE-153 add provider usage persistence and Credit ledger mutation.
- [ ] The workspace entry remains an application tool surface, not a marketing
  demo or account settings page.

## GNE-152/GNE-153 Usage And Credit Ledger Checks

- [ ] Successful mock text generation writes a committed
  `billing_usage_ledger` row for `ai_tokens`.
- [ ] The same successful request writes a `billing_credit_ledger` `consume`
  event with `source_type = ai_usage`.
- [ ] The usage row links to the Credit ledger row through
  `related_credit_ledger_id`.
- [ ] Usage metadata includes provider, provider mode, model, provider request
  id, finish reason, token counts when available, requested Credit, request id,
  purpose, and capability.
- [ ] Usage metadata does not store raw prompts, generated output, provider
  payloads, or secrets.
- [ ] The workspace result shows deducted Credit and recorded usage state.
- [ ] The account AI page shows the new Credit consumption record and updated
  available Credit.
- [ ] Blocked or failed calls still do not deduct Credit.

## GNE-154 Entitlement Gate And Model Access Checks

- [ ] AI model config declares each text model's Credit feature and optional
  minimum plan requirement.
- [ ] The AI service evaluates model access from the Billing snapshot before
  provider adapter creation.
- [ ] The workspace AI form lets users choose a configured text model without
  exposing provider secrets or provider SDK behavior to the page.
- [ ] A reserved/unconfigured model returns `provider_unconfigured`, displays a
  clear blocked state, consumes `0 Credit`, and does not write usage records.
- [ ] A normal model can still generate a mock result and commit Credit usage.
- [ ] Model unavailable, entitlement missing, quota exhausted, provider
  unconfigured, and provider failed reasons are translated into user-facing
  copy instead of raw reason ids.

## GNE-199 App Review Checks

- [ ] Reviewers can start from `/dashboard`, enter product-specific AI input,
  choose a configured text model, and submit through the workspace Server
  Action.
- [ ] The workspace result shows the app-facing result, provider mode, model
  label, gate status, estimated Credit, deducted Credit, and record state.
- [ ] A normal mock model produces a deterministic result and commits Credit
  usage through the existing Billing ledger path.
- [ ] A reserved/unconfigured model shows a blocked state, consumes `0 Credit`,
  and does not write a committed usage record.
- [ ] Reviewers can open `/account/usage` to see available Credit, plan-vs-pack
  Credit sources, the credit-pack top-up entry, top-up records, and Credit
  consumption records.
- [ ] Reviewers can open `/account/billing` to choose Free, Plus, or Pro plans;
  Plans remain separate from the AI Credit surface.
- [ ] The AI account surface does not become an AI prompt playground and does
  not show provider tokens as the user's balance.
- [ ] The review path is usable without a real AI provider key and does not
  expose raw prompts, generated output, provider payloads, or secrets in
  Billing ledger metadata.

## GNE-155 Safety And Boundary Checks

- [ ] `.env.example` keeps `AI_PROVIDER_API_KEY` empty and no real AI key value
  is committed.
- [ ] No browser-visible `NEXT_PUBLIC_*AI*KEY/SECRET/TOKEN` variable is used in
  source files.
- [ ] App pages and client components still do not import real model provider
  SDKs.
- [ ] AI usage metadata excludes raw prompts, generated text, provider payloads,
  API keys, and secrets.
- [ ] `billing_credit_ledger` and `billing_usage_ledger` keep unique
  idempotency keys.
- [ ] Repeated requests with an already committed AI idempotency key are blocked
  before provider invocation and consume `0 Credit`.
- [ ] Concurrent duplicate requests that collide at ledger commit time return a
  `duplicate` result and consume `0 Credit` for the retry.
- [ ] Provider failure, provider unconfigured, model unavailable, entitlement
  missing, quota exhausted, duplicate, and usage-record failure paths do not
  silently deduct Credit.
- [ ] Safe server-side analytics events exist for `ai_request_started`,
  `ai_request_completed`, `ai_request_failed`, and `quota_limit_reached`.
- [ ] `npm run test:ai-safety` passes locally.

## GNE-160 Deploy Readiness Checks

- [ ] `.env.example`, `context/environment-matrix.md`, and `integrations/ai.md`
  list AI provider env keys with server-only/public boundaries and no real
  values.
- [ ] No `NEXT_PUBLIC_` AI provider secret or budget variable exists in source.
- [ ] `AI_BUDGET_LIMIT` is enforced in the server-only AI service before
  provider creation, provider calls, or Credit ledger writes.
- [ ] Requests above the budget cap return `budget_limited`, consume `0 Credit`,
  do not write a committed usage record, and emit only safe analytics summary
  properties.
- [ ] Mock/no-op AI remains valid without `AI_PROVIDER_API_KEY`.
- [ ] Production smoke has explicit steps and pass criteria for one low-cost
  signed-in workspace request, usage/Credit record verification, safe analytics
  verification, and rollback.
- [ ] Deployment memory records production AI smoke as `not_run` unless a human
  or approved tool actually verifies the deployed path.

## Technical Checks

- [ ] Markdown docs are readable and linked from `integrations/ai.md`.
- [ ] No secrets, real provider credentials, raw prompts, or generated private
  output are committed.
- [ ] `context/status.md` records completed AI boundary steps.

## Product Checks

- [ ] The product story remains simple: AI workflows happen in the workspace;
  Credit balance and top-up remain in the AI account area; Plans stay in Plans.
- [ ] The future reviewer path can show input, gate, provider mode, result,
  usage/Credit outcome, and failure states without exposing tokens as balance.
