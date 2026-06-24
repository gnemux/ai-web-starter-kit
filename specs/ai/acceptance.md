# Acceptance: MVP2 AI Foundation

## Verification Snapshot

Last local verification for the MVP2 AI foundation:

- `pnpm test:ai-safety` passed.
- `pnpm test:release-boundaries` passed.
- `pnpm typecheck` passed.
- `pnpm test`, `pnpm lint`, and `pnpm build` passed in the final release
  hardening run.
- Local browser/API smoke passed for signed-in dashboard load, AI immediate
  minimum-length validation, unauthenticated AI API guard, and safe blocked
  states without real-provider keys.
- Real-provider production smoke remains `not_run` until a provider is
  configured, deployed, and verified by a human or approved tool.

## GNE-149 Boundary Checks

- [x] Provider, model, capability, token, usage, Credit, quota, entitlement, and
  ledger are defined in `specs/ai/product-spec.md` and
  `specs/ai/engineering-spec.md`.
- [x] The docs clearly state that users see Credit, not provider tokens.
- [x] The docs clearly separate provider usage facts from commercial Credit
  ledger facts.
- [x] The docs define the server-only AI service boundary before any real AI
  provider integration.
- [x] The docs clarify that sample AI input/result workflows belong in the
  workspace or product workflow, while the account AI page remains the Credit
  account surface.
- [x] Failure and blocked states include unauthenticated, entitlement missing,
  quota exhausted, model unavailable, provider unconfigured, budget limited,
  provider failure, timeout, and duplicate request handling.
- [x] Billing, Payment, AI, and Analytics responsibilities are separated.

## Functional Checks

- [x] Existing Plans and AI Credit pages are not changed by GNE-149.
- [x] Later AI sub-issues can cite this spec as their shared boundary.
- [x] No provider key, model selection, token conversion, or Credit deduction
  rule is assigned to page components.

## GNE-156 Service Boundary Checks

- [x] AI request/response types are exported from `packages/core/src/ai.ts`.
- [x] Server-only AI service entry points exist in `apps/web/lib/services/ai.ts`.
- [x] A controlled API route exists at `apps/web/app/api/ai/text/route.ts`.
- [x] The API route calls the AI service and does not import a provider SDK.
- [x] The AI service checks the current account and Billing entitlement before
  invoking the provider adapter.
- [x] Successful mock calls return provider mode, model, result, gate state, and
  explicit deferred usage/Credit status.
- [x] Blocked calls do not invoke the provider adapter and do not consume Credit.
- [x] Real provider keys are not introduced and no `NEXT_PUBLIC_` AI secret is
  added.

## GNE-150 Provider Adapter And Model Config Checks

- [x] AI provider contracts reserve text, chat, embedding, moderation, usage,
  finish reason, and error mapping shapes in `packages/core/src/providers.ts`.
- [x] AI model config defines provider, provider model id, capabilities, cost
  profile, default/fallback behavior, and enabled state.
- [x] Server-only model catalog exists in `apps/web/lib/providers/ai-models.ts`.
- [x] Server provider factory can create mock and no-op AI providers without real
  provider keys.
- [x] AI service resolves model config before entitlement preflight and provider
  invocation.
- [x] Adding a future real provider should require provider/model/service wiring,
  not page-level changes.
- [x] `.env.example` documents mock/no-op AI provider mode without adding real
  secrets.

## GNE-151 Service Example Checks

- [x] Workspace includes an AI input/result workflow that calls the AI service
  through a Server Action.
- [x] The workflow runs locally without a real provider key through mock/no-op
  provider behavior.
- [x] The page shows provider mode, model, entitlement gate result, mock/no-op
  result, estimated Credit, deducted Credit, and record state.
- [x] The page does not import a provider SDK, expose provider secrets, or place
  model/Credit logic in the component.
- [x] The result path returns explicit deferred record status until GNE-152 and
  GNE-153 add provider usage persistence and Credit ledger mutation.
- [x] The workspace entry remains an application tool surface, not a marketing
  demo or account settings page.

## GNE-152/GNE-153 Usage And Credit Ledger Checks

- [x] Successful mock text generation writes a committed
  `billing_usage_ledger` row for `ai_tokens`.
- [x] The same successful request writes a `billing_credit_ledger` `consume`
  event with `source_type = ai_usage`.
- [x] The usage row links to the Credit ledger row through
  `related_credit_ledger_id`.
- [x] Usage metadata includes provider, provider mode, model, provider request
  id, finish reason, token counts when available, requested Credit, request id,
  purpose, and capability.
- [x] Usage metadata does not store raw prompts, generated output, provider
  payloads, or secrets.
- [x] The workspace result shows deducted Credit and recorded usage state.
- [x] The account AI page shows the new Credit consumption record and updated
  available Credit.
- [x] Blocked or failed calls still do not deduct Credit.

## GNE-154 Entitlement Gate And Model Access Checks

- [x] AI model config declares each text model's Credit feature and optional
  minimum plan requirement.
- [x] The AI service evaluates model access from the Billing snapshot before
  provider adapter creation.
- [x] The workspace AI form lets users choose a configured text model without
  exposing provider secrets or provider SDK behavior to the page.
- [x] A reserved/unconfigured model returns `provider_unconfigured`, displays a
  clear blocked state, consumes `0 Credit`, and does not write usage records.
- [x] A normal model can still generate a mock result and commit Credit usage.
- [x] Model unavailable, entitlement missing, quota exhausted, provider
  unconfigured, and provider failed reasons are translated into user-facing
  copy instead of raw reason ids.

## GNE-199 App Review Checks

- [x] Reviewers can start from `/dashboard`, enter product-specific AI input,
  choose a configured text model, and submit through the workspace Server
  Action.
- [x] The workspace result shows the app-facing result, provider mode, model
  label, gate status, estimated Credit, deducted Credit, and record state.
- [x] A normal mock model produces a deterministic result and commits Credit
  usage through the existing Billing ledger path.
- [x] A reserved/unconfigured model shows a blocked state, consumes `0 Credit`,
  and does not write a committed usage record.
- [x] Reviewers can open `/account/usage` to see available Credit, plan-vs-pack
  Credit sources, the credit-pack top-up entry, top-up records, and Credit
  consumption records.
- [x] Reviewers can open `/account/billing` to choose Free, Plus, or Pro plans;
  Plans remain separate from the AI Credit surface.
- [x] The AI account surface does not become an AI prompt playground and does
  not show provider tokens as the user's balance.
- [x] The review path is usable without a real AI provider key and does not
  expose raw prompts, generated output, provider payloads, or secrets in
  Billing ledger metadata.

## GNE-155 Safety And Boundary Checks

- [x] `.env.example` keeps `AI_PROVIDER_API_KEY` empty and no real AI key value
  is committed.
- [x] No browser-visible `NEXT_PUBLIC_*AI*KEY/SECRET/TOKEN` variable is used in
  source files.
- [x] App pages and client components still do not import real model provider
  SDKs.
- [x] AI usage metadata excludes raw prompts, generated text, provider payloads,
  API keys, and secrets.
- [x] `billing_credit_ledger` and `billing_usage_ledger` keep unique
  idempotency keys.
- [x] Repeated requests with an already committed AI idempotency key are blocked
  before provider invocation and consume `0 Credit`.
- [x] Concurrent duplicate requests that collide at ledger commit time return a
  `duplicate` result and consume `0 Credit` for the retry.
- [x] Provider failure, provider unconfigured, model unavailable, entitlement
  missing, quota exhausted, duplicate, and usage-record failure paths do not
  silently deduct Credit.
- [x] Safe server-side analytics events exist for `ai_request_started`,
  `ai_request_completed`, `ai_request_failed`, and `quota_limit_reached`.
- [x] `npm run test:ai-safety` passes locally.

## GNE-160 Deploy Readiness Checks

- [x] `.env.example`, `context/environment-matrix.md`, and `integrations/ai.md`
  list AI provider env keys with server-only/public boundaries and no real
  values.
- [x] No `NEXT_PUBLIC_` AI provider secret or budget variable exists in source.
- [x] `AI_BUDGET_LIMIT` is enforced in the server-only AI service before
  provider creation, provider calls, or Credit ledger writes.
- [x] Requests above the budget cap return `budget_limited`, consume `0 Credit`,
  do not write a committed usage record, and emit only safe analytics summary
  properties.
- [x] Mock/no-op AI remains valid without `AI_PROVIDER_API_KEY`.
- [x] Production smoke has explicit steps and pass criteria for one low-cost
  signed-in workspace request, usage/Credit record verification, safe analytics
  verification, and rollback.
- [x] Deployment memory records production AI smoke as `not_run` unless a human
  or approved tool actually verifies the deployed path.

## Technical Checks

- [x] Markdown docs are readable and linked from `integrations/ai.md`.
- [x] No secrets, real provider credentials, raw prompts, or generated private
  output are committed.
- [x] `context/status.md` records completed AI boundary steps.

## Product Checks

- [x] The product story remains simple: AI workflows happen in the workspace;
  Credit balance and top-up remain in the AI account area; Plans stay in Plans.
- [x] The future reviewer path can show input, gate, provider mode, result,
  usage/Credit outcome, and failure states without exposing tokens as balance.
