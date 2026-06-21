# AI Integration

## Purpose

AI integration supports provider-based model calls, token usage tracking, credit/quota consumption, and entitlement-gated high-cost product features.

## Status

Planned for MVP2. The Linear execution source is `GNE-148 MVP2 AI-00 [AI] AI Provider、Usage、Credit 与 Entitlement 底座`.

Provider matrix and stage boundaries live in `integrations/provider-matrix.md`.

## Strategy

AI calls must go through a server-only service boundary and provider adapter. Pages and client components must not call model provider SDKs directly.

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

## Environment Variables

Names will be finalized by `MVP2-INT-03` and `AI-09`. Until then:

```text
AI_PROVIDER=
AI_MODEL=
AI_PROVIDER_API_KEY=
AI_BUDGET_LIMIT=
```

Provider secrets must be server-only. Do not create `NEXT_PUBLIC_` AI provider secret variables.

## Rules

- Never expose provider secrets to browser code, logs, Linear comments, docs, screenshots, or PR bodies.
- Do not record raw prompts, generated text, provider payloads, customer secrets, or personal sensitive content in analytics.
- AI usage is a measurement fact; Billing credit/quota ledger is the commercial fact.
- Analytics may observe AI events, but it must not be the source of entitlement, usage, or credit truth.
- Failed, timed-out, retried, or duplicated model calls must have explicit usage and credit handling rules.

## Linear Execution Order

```text
GNE-148 MVP2 AI-00
├── GNE-149 AI-01 [DOC][MVP2] Define AI provider, model, token, credit, and entitlement boundaries
├── GNE-156 AI-02 [API][MVP2] Define AI service and server-only call boundary
├── GNE-150 AI-03 [DEV][MVP2] Build AI Provider Adapter and model config
├── GNE-151 AI-04 [DEV][MVP2] Build AI Service examples: chat, completion, embedding
├── GNE-152 AI-05 [DATA][MVP2] Build Token Usage measurement model
├── GNE-153 AI-06 [DEV][MVP2] Build Credit / Quota Ledger and subscription allowance link
├── GNE-154 AI-07 [DEV][MVP2] Build AI Entitlement Gate and model access limits
├── GNE-155 AI-08 [TEST][MVP2] Verify key safety, token idempotency, and quota boundaries
└── GNE-160 AI-09 [DEPLOY][MVP2] Provider secrets, budget limits, and production smoke test
```
