# Product Spec: MVP2 AI Foundation

## Summary

AI foundation defines how future products built from this template expose AI
features without coupling the product UI to a specific model provider. Users see
Credit, clear access states, and useful AI workflows. Provider tokens, model
pricing, secrets, and Credit conversion stay behind a server-side AI service.

## User

- Primary user: a signed-in product user who uses an AI-assisted workflow in the
  app workspace.
- Secondary user: a builder who uses this starter kit and needs clear extension
  points for real AI providers later.
- Reviewer: a teammate who verifies the AI path from the app without reading
  implementation details.

## Problem

AI usage has three different meanings that must not be mixed in UI or page
components:

- Provider usage: provider/model technical facts such as input and output
  tokens.
- Product value: the user-facing AI result that belongs in a workflow such as
  the workspace.
- Commercial allowance: Credit, quota, and entitlement facts owned by Billing.

Without a shared boundary, provider keys, model selection, token measurement,
Credit deduction, and failure handling can drift into pages and become hard to
replace or verify.

## Goals

- Keep the existing Plans and AI Credit pages clear: Plans manage subscriptions;
  the AI page manages Credit balance, top-up, and records.
- Put sample AI usage in a workflow entry such as the workspace instead of
  turning the account area into an AI playground.
- Expose Credit to users and keep provider tokens as internal measurement data.
- Establish a provider-neutral service layer before any real AI provider is
  integrated.
- Make entitlement, quota, provider mode, result, and Credit outcome observable
  for human review.

## Non-goals

- Do not integrate a real AI model provider in MVP2 AI-01.
- Do not finalize real model pricing, overseas/china provider selection, or
  production budget policy.
- Do not show provider tokens as the user's AI balance.
- Do not move Billing or Payment truth into AI pages, success URLs, analytics,
  or client state.
- Do not add marketing-style AI demos as the primary product experience.

## User Journey

```text
workspace AI entry
-> user enters a prompt or product-specific input
-> app calls the server-side AI service
-> AI service checks entitlement and quota through Billing
-> AI service selects provider mode and model through server config
-> provider adapter returns mock/no-op or future real output
-> AI service records usage and Credit outcome
-> UI shows result, provider mode, gate status, and Credit outcome
```

## Core Concepts

- Provider: the external or internal system that can produce AI output. Examples:
  mock, no-op, OpenAI-compatible, or a future China-friendly provider.
- Model: a provider-specific or provider-neutral model label selected by
  server-side config.
- Capability: the kind of AI work requested, such as text generation,
  completion, chat, embedding, or moderation.
- Token: provider-side technical measurement. Tokens are used for cost
  estimation and audit, not as the product user's balance.
- Usage: a measured AI request outcome, including provider, model, status,
  token counts when available, and timing/error facts.
- Credit: the product-facing commercial unit. Users buy, receive, and consume
  Credit.
- Quota: the current allowance available to a user for a feature, plan, period,
  model tier, or Credit pack.
- Entitlement: the server-side decision that a user can access a feature,
  capability, model tier, or Credit amount.
- Ledger: an append-only commercial record for grants, consumption, refunds,
  expiration, releases, and adjustments.
- Provider mode: real, sandbox, mock, no-op, or reserved. MVP2 starts with mock
  or no-op.

## Requirements

- AI workflows must call a server-side AI service; pages and client components
  must not import provider SDKs.
- The AI service owns model selection, provider selection, token-to-Credit
  conversion, usage recording, and idempotency decisions.
- Billing owns entitlement, quota, Credit grants, Credit consumption, and
  remaining balance.
- Operator budget limits can block a high-cost request before provider calls,
  but they are not shown as the user's balance and do not replace Billing
  entitlement decisions.
- Payment only creates trusted commercial events that Billing can convert into
  subscriptions, orders, entitlements, or Credit grants.
- Analytics can observe high-level AI events but must not store raw prompts,
  generated output, provider payloads, secrets, or decide entitlement.
- The account AI page must remain focused on balance, top-up, recharge records,
  and consumption records.
- A future sample AI action should live in a product workflow entry such as the
  workspace and link back to AI Credit only when the gate blocks usage.
- Failed, timed-out, duplicated, or blocked requests must not silently deduct
  Credit.

## Edge States

- Empty: no AI history yet; the UI should explain the next available action
  without implying real provider readiness.
- Loading: the AI workflow should show that the request is being processed by
  the app service, not by a client-side provider SDK.
- Error: provider failures, unavailable models, and timeouts should be visible
  as recoverable states.
- Permission denied: unauthenticated, insufficient entitlement, and quota
  exhausted states should stop before provider calls and Credit deduction.
- Long content: prompt, output, model labels, and failure text must wrap without
  breaking the app-shell layout.

## Success Metrics

- Activation: a reviewer can complete one mock/no-op AI workflow from the
  workspace entry.
- Conversion: quota-blocked users are guided to the existing Plans or AI Credit
  top-up path.
- Quality: users understand remaining Credit without seeing provider tokens.
- Safety: no provider secret, raw prompt, or generated private output appears in
  client code, analytics, logs, docs, or screenshots.
