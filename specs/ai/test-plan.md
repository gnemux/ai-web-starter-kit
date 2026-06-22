# Test Plan: MVP2 AI Foundation

## Documentation Checks

- Confirm `specs/ai/product-spec.md` explains the product workflow and user
  concepts without provider-specific implementation leakage.
- Confirm `specs/ai/engineering-spec.md` defines ownership, server-only
  boundary, token-to-Credit policy, failure states, and provider mode rules.
- Confirm `integrations/ai.md` points to `specs/ai/*` as the GNE-149 contract.

## Future Unit Tests

- AI service rejects malformed input before provider calls.
- AI entitlement gate blocks unauthenticated, missing entitlement, quota
  exhausted, model unavailable, provider unconfigured, and budget-limited cases.
- Token-to-Credit conversion uses server-side model configuration.
- Idempotency prevents duplicate Credit consumption.

## Future Integration Tests

- Mock/no-op provider returns a stable result without a real provider key.
- Blocked requests do not call the provider adapter and do not deduct Credit.
- Successful mock/no-op usage records provider usage and Billing Credit outcome
  according to the selected policy.
- Provider failure and timeout paths do not silently deduct Credit.

## Current GNE-156 Checks

- Run TypeScript checks for `packages/core` and `apps/web`.
- Call `POST /api/ai/text` only through the local app boundary in later browser
  work; do not call provider SDKs from pages.
- Inspect the route and service imports to confirm no AI provider SDK or
  `NEXT_PUBLIC_` AI secret is introduced.
- Confirm successful mock responses return `record_deferred` and `not_recorded`
  until GNE-152 and GNE-153 implement persistence and ledger mutation.

## Current GNE-150 Checks

- Run TypeScript checks for `packages/core` and `apps/web`.
- Confirm `apps/web/lib/providers/ai-models.ts` resolves `mock-text` by default.
- Confirm `AI_PROVIDER=noop` can select the no-op model when `AI_MODEL` is unset.
- Confirm `createConfiguredAiProvider()` returns mock/no-op adapters without real
  provider SDKs or keys.
- Confirm AI service uses model preflight Credit from model config instead of
  page or route-level constants.

## Current GNE-151 Checks

- Run TypeScript checks for `packages/core` and `apps/web`.
- Open `/dashboard` and confirm the AI draft workflow is visible.
- Submit a product scenario and confirm the result shows mock/no-op output,
  provider mode, model, entitlement gate state, estimated Credit, deducted
  Credit, and record state.
- Confirm the page remains usable at desktop width and a mobile-sized viewport
  without horizontal overflow.
- Confirm the workflow does not require a real provider key.

## Current GNE-152/GNE-153 Checks

- Run TypeScript checks for `packages/core` and `apps/web`.
- Submit the workspace AI draft form with the mock provider.
- Confirm the result shows `1,000 Credit` deducted and record state `已记录`.
- Open `/account/usage` and confirm the latest Credit consumption record appears.
- Confirm available Credit decreases by the committed usage amount.
- Confirm no raw prompt or generated output is written to usage or Credit ledger
  metadata.
- Confirm failed or blocked calls return explicit states and do not write
  committed usage.

## Current GNE-154 Checks

- Run TypeScript checks for `packages/core` and `apps/web`.
- Open `/dashboard` and confirm the AI form exposes a model selector.
- Select the reserved model and submit a prompt.
- Expected result: blocked state, user-facing "model not connected" message,
  `0 Credit` deducted, and no recorded usage state.
- Select the standard draft model and submit a prompt.
- Expected result: generated mock output, `1,000 Credit` deducted, and recorded
  usage state.
- Confirm the page still keeps model/provider logic behind the server-side AI
  service and does not import provider SDKs.

## Current GNE-199 Checks

- Run TypeScript checks for `packages/core`, `packages/ui`, and `apps/web`.
- Open `/dashboard` and confirm the workspace AI workflow is the sample input
  and result surface.
- Confirm the model selector supports standard, premium, no-op, and reserved
  review states without exposing provider secrets or provider SDKs.
- Submit with the reserved model and confirm the blocked result consumes
  `0 Credit` and does not record usage.
- Submit with the standard mock model only when a fresh success-path check is
  needed; it should show a deterministic result, `1,000 Credit` deducted, and
  a recorded usage state.
- Open `/account/usage` and confirm it is limited to available Credit,
  plan-vs-pack source split, credit-pack top-up, top-up records, and Credit
  consumption records.
- Open `/account/billing` and confirm plan selection remains in Plans instead
  of the AI menu.
- Confirm the AI page does not show provider tokens as balance, raw provider
  data, or implementation-only badges.

## Current GNE-155 Checks

- Run `npm run test:ai-safety`.
- Run TypeScript checks for `packages/core`, `packages/ui`, and `apps/web`.
- Confirm `.env.example` keeps `AI_PROVIDER_API_KEY` empty and no
  `NEXT_PUBLIC_*AI*KEY/SECRET/TOKEN` variables exist in source files.
- Confirm `apps/web/lib/services/ai.ts` remains server-only and calls the
  Billing service for entitlement, idempotency, and Credit commit behavior.
- Confirm `apps/web/lib/services/billing.ts` uses insert-first ledger writes and
  handles unique `idempotency_key` conflicts as duplicate `0 Credit` outcomes.
- Submit two `POST /api/ai/text` requests with the same idempotency key in an
  authenticated local browser session.
  Expected result: the first standard mock request records `1,000 Credit`; the
  second returns `duplicate`, consumes `0 Credit`, and does not create another
  committed usage record.
- Submit or select a blocked model state such as the reserved model.
  Expected result: provider is not invoked through a real SDK, Credit consumed
  is `0`, and the result reason is user-facing.
- Confirm AI server analytics only include safe summary fields:
  provider/mode/model, reason, Credit amounts, result, source, and record
  status. They must not include raw prompt, generated text, provider payloads,
  API keys, or secrets.

## Current GNE-160 Checks

- Run `npm run test:ai-safety`.
- Run TypeScript checks for `packages/core`, `packages/ui`, and `apps/web`.
- Confirm `.env.example` keeps `AI_PROVIDER_API_KEY` and `AI_BUDGET_LIMIT`
  empty while documenting both as server-only.
- Confirm `AI_BUDGET_LIMIT` is read only by server-side AI service code and is
  never exposed through `NEXT_PUBLIC_`.
- Temporarily set `AI_BUDGET_LIMIT` below the selected model's estimated Credit
  in a local ignored env or shell session, submit the workspace AI form, and
  expect `budget_limited`, `0 Credit` consumed, no committed usage record, and
  no provider SDK call.
- Leave `AI_BUDGET_LIMIT` empty for normal mock/no-op local work and confirm the
  existing workspace AI path still behaves as before.
- For production smoke after a real provider is configured: verify Vercel
  server-only env entries by key name only, redeploy, sign in, submit one
  low-cost workspace AI request, confirm the AI Credit record on
  `/account/usage`, confirm safe AI analytics event properties, and record the
  result in `context/deployment-status.md`.

## Future Browser / E2E Checks

- Path: workspace AI entry -> input -> submit -> result.
- Expected result: UI shows provider mode, model label, entitlement/quota status,
  mock/no-op output, and Credit outcome.
- Path: quota exhausted -> submit.
- Expected result: UI blocks before provider call and links to Plans or AI
  Credit top-up without changing entitlement from client state.

## Manual Verification

- Review `/account/billing` to confirm Plans remain the plan selection surface.
- Review `/account/usage` to confirm AI Credit remains the balance, top-up, and
  record surface.
- Review the future workspace AI sample once implemented to confirm the input
  and result flow does not live inside Billing or Payment pages.

## Regression Risks

- Page components import provider SDKs or provider-specific model config.
- Token counts appear as a user-facing balance.
- Analytics stores raw prompt or generated private content.
- Failed, timed-out, or duplicated requests consume Credit without an explicit
  ledger rule.
- Payment result URLs or account pages become entitlement sources of truth.
