# GNE-261 Capability Action Map

## Scope

GNE-261 maps MVP3 Reference Product business actions to capability contracts so
GNE-262 through GNE-267 can wire Audit, Outbox, AI, Billing/Credit, PostHog,
and reliability without re-deciding boundaries in each child issue.

This document is the CAP-01 handoff, not a runtime implementation. It improves
the common foundation by making the adapter boundary, portable context, and
Cloudflare/Hono risk explicit before capability code is added.

## Non-Goals

- Do not implement Audit storage, Outbox persistence, live AI, live payment,
  entitlement gates, or PostHog runtime wiring.
- Do not move CatCare business tables or services into `packages/*`.
- Do not extract CatCare share-token persistence or DTOs. GNE-266 has a named
  second consumer (Travel), so the provider-free anonymous actor and
  valid/expired/revoked/invalid/unavailable authorization-state contract may be
  promoted to `@xwlc/platform`; runtime crypto and product rows stay app-local.
- Do not add migrations or touch the online Supabase test database.

## Decision Labels

Machine-readable field: `foundation_decision`.

| Label | Meaning |
| --- | --- |
| `common_contract_verified` | A reusable contract already exists in `packages/*` and the child issue should implement behind that contract. |
| `common_pattern_not_extracted` | The pattern is reusable, but the current implementation is still product-local until a second product validates extraction. |
| `product_foundation` | The behavior belongs to the Reference Product foundation but is still product-domain code. |
| `catcare_specific` | The behavior depends on CatCare entities, copy, or task semantics and should remain in `apps/web`. |
| `not_run` | The capability is only identified here; implementation and evidence belong to a later CAP issue. |

## Required Portable Context

Machine-readable risk field: `cloudflare_hono_risk`.

Every capability-facing service call should carry explicit context instead of
depending on framework globals:

- `actor`: authenticated owner, anonymous token actor, or system actor.
- `owner_id`: the owner boundary for owner-only product facts.
- `resource_id` and `resource_type`: plan, task, token, order, or AI request.
- `token_scope`: anonymous share-link scope when the actor is a token.
- `correlation_id`: cross-capability trace key for Audit/PostHog/Outbox.
- `idempotency_key`: retry and duplicate guard where the action can be repeated.
- `source`: UI route or server action that initiated the business action.

Supabase RLS remains the current database defense, but the app-layer service
must still pass owner/token filters. If a future Cloudflare + Hono deployment
uses a no-RLS store, these filters must still prevent cross-owner or
cross-token reads and writes.

## Action Map

| Business action | Product fact | Capability mapping | Adapter boundary | Foundation decision | Cloudflare/Hono risk | Owning issue |
| --- | --- | --- | --- | --- | --- | --- |
| Owner signs in and opens CatCare workspace | Session summary plus owner-scoped workspace read | Audit optional for workspace access; PostHog page/session event optional | Route resolves `PlatformActor`, then product service receives `actor.id` as `owner_id` | `common_contract_verified` for actor/session, `product_foundation` for workspace | Medium: no-RLS store must not infer owner from client route | GNE-266 if tracked |
| Owner creates or edits cat profile | `cats` row | Audit optional; PostHog product action optional | Product service owns CatCare validation, capability adapters only receive redacted event fields | `catcare_specific` | Medium: owner filter must remain explicit | GNE-266 optional |
| Owner saves routines, item library, or event history | `care_routines`, `care_routine_items`, `owner_item_library`, `cat_item_assignments`, `care_events` | PostHog product action optional; future AI can read summaries through product DTOs | Product service returns domain DTO; AI/PostHog must not read raw private notes directly | `catcare_specific` plus `product_foundation` | Medium: private notes and cat names need explicit redaction decisions | GNE-264/GNE-266 |
| Owner generates a draft care plan | `care_plans` and `care_tasks` in draft/review state | AI may draft text later; PostHog generation event; Billing/Credit gate if live AI is used | UI triggers business action, product service calls AI facade only with owner, purpose, idempotency key, and redacted inputs | `product_foundation`; AI contract is `common_contract_verified` | High if prompt/private inputs are passed directly to provider without redaction | GNE-264/GNE-265/GNE-266 |
| Owner publishes a care plan | `care_plans.status = published` | Required Audit event; optional Outbox notification; PostHog publish event | Product service commits plan state, then emits capability events with `plan_id` and `correlation_id` | `common_pattern_not_extracted` for publish audit pattern | Medium: event emission must be after authorized owner write | GNE-262/GNE-263/GNE-266 |
| Owner creates or regenerates private share link | `share_tokens` row with hash, scope, expiry, revoked state | Required Audit event; optional Outbox notification; PostHog share event | Product-local share service owns raw-token one-time return and Node crypto; platform owns only generic authorization states | `common_contract_verified` for state contract; persistence stays product-local | High: bearer link safety depends on never logging raw token/hash and preserving scope filters | GNE-262/GNE-263/GNE-266 |
| Owner revokes private share link | Existing `share_tokens` row becomes revoked | Required Audit event; optional Outbox notification; PostHog revoke event | Product service verifies owner, writes revoke state, then emits redacted token event | `common_pattern_not_extracted` | High: old token must fail even if forwarded or cached | GNE-262/GNE-263/GNE-266 |
| Anonymous opens valid private link | Token resolves to plan and minimum sitter DTO | Audit page access; PostHog anonymous access event optional | Public platform contract resolves generic anonymous actor/status after the app crypto adapter verifies the secret; CatCare maps only its scoped DTO | `common_contract_verified` for gate state; DTO remains `catcare_specific` | High: no-RLS store must enforce token scope at repository layer | GNE-262/GNE-266 |
| Anonymous opens invalid, expired, or revoked link | Rejection state, no product facts exposed | Required security Audit event; PostHog rejection optional | Token gate returns typed denial without plan/task payload | `common_pattern_not_extracted` | High: denial must not leak whether an owner/plan exists | GNE-262/GNE-266 |
| Anonymous submits or updates task result | `care_submissions` row at plan/date/visit/task scope | Required Audit event; optional Outbox to owner; PostHog submit event | Anonymous submission service receives token scope, task scope, whitelist, correlation id, and idempotency key | `common_pattern_not_extracted` for anonymous command pattern; `catcare_specific` for fields | High: duplicate and cross-task writes must be guarded without trusting client ids | GNE-262/GNE-263/GNE-266/GNE-267 |
| Owner views result list or result detail | Owner-readable `care_submissions` summary | PostHog result-view event optional; AI recap entry may be offered | Owner service reads by owner/plan only; AI recap consumes summarized DTO, not raw DB rows | `product_foundation` | Medium: result rows must never be visible across owners | GNE-264/GNE-266 |
| Owner requests AI recap or reminder copy | AI request, optional accepted output, usage facts | Billing/Credit gate, AI provider call, Audit/Outbox/PostHog for request lifecycle | Product service builds redacted prompt; core AI facade normalizes input, idempotency, usage, and provider mode | `common_contract_verified` for AI/Billing contracts; CatCare recap wired in GNE-264 | High: prompt privacy, credit idempotency, and failure fallback must be explicit | GNE-264/GNE-265/GNE-267 |
| Owner reaches entitlement or quota gate | Entitlement snapshot and usage/credit ledger facts | Billing/Credit decision; PostHog quota event; Audit optional for blocked critical action | Product code asks core billing facade for `owner_id`, feature key, units, and idempotency key; blocked CatCare AI can enter sandbox checkout and return to the original plan | `common_contract_verified`; CatCare return flow wired in GNE-265 | Medium: quota cannot rely on client-side state or unsafe return URLs | GNE-265/GNE-266 |
| Owner starts sandbox/test checkout or receives payment callback | `billing_orders`, `billing_subscriptions`, `billing_entitlements`, `billing_usage_ledger`, `payment_events` | Billing, payment, Audit, PostHog payment events | Payment adapter normalizes provider event, product service writes owner-scoped facts | `common_contract_verified` | High: webhook idempotency and owner/price mapping must be server-side | GNE-265/GNE-267 |
| Capability event should notify or run later | Outbox row or internal event envelope | Outbox enqueue and retry | Product service emits `OutboxEvent` with destination, idempotency key, actor, and correlation id | `common_contract_verified`; persistence `not_run` | Medium: background workers need the same owner/token/resource scope | GNE-263/GNE-267 |
| Capability action is tracked for product analytics | PostHog event or analytics adapter event | PostHog event with shared correlation id | Platform analytics port receives redacted `PlatformEvent`; product-specific properties stay whitelisted | `common_contract_verified` | Medium: analytics must not receive raw token, token hash, private notes, or full handoff text | GNE-266 |
| Retry, duplicate, or partial failure occurs | Idempotency key, failure reason, retry status | Audit failure, Outbox retry, Billing/AI usage repair, PostHog error event | All mutating adapters accept idempotency key and return typed result instead of throwing across boundary | `common_pattern_not_extracted` | High: without idempotency, anonymous submit and payment callbacks can duplicate facts | GNE-267 |

## Common Foundation Upgrade From GNE-261

GNE-261 does not add runtime code, but it strengthens the common foundation in
three concrete ways:

- It standardizes the capability handoff shape around actor, owner scope,
  anonymous token scope, `correlation_id`, and `idempotency_key`.
- It marks existing reusable contracts in `@xwlc/platform`, `@xwlc/db`, and
  `@xwlc/core` so CAP issues add adapters behind those contracts instead of
  writing one-off CatCare calls.
- It prevents premature extraction by labeling share-token and anonymous-submit
  behavior as reusable patterns that stay product-local until another reference
  product proves the same abstraction.

## Child Issue Handoff

| Issue | Must implement from this map | Must not do |
| --- | --- | --- |
| GNE-262 CAP-02 Audit | Publish, share create/regenerate, share revoke, anonymous valid/denied access, anonymous submit/update; include owner-visible activity surface and correlation id | No raw token, token hash, owner email, full notes, or private handoff text in audit payloads |
| GNE-263 CAP-03 Outbox | Owner notification and async task envelopes with idempotency and scope | No direct email/provider call from page components |
| GNE-264 CAP-04 AI | Recap/reminder copy through redacted DTOs and core AI contract | No raw DB row prompting, no live provider call without entitlement/usage handling |
| GNE-265 CAP-05 Billing/Credit | Entitlement and credit gate before live AI/payment actions | No client-side quota trust, no unscoped ledger writes |
| GNE-266 CAP-06 PostHog | Capability events with shared `correlation_id` and redacted properties | No analytics payload with raw token, token hash, private notes, or full handoff text |
| GNE-267 CAP-07 Reliability | Idempotency, retry, duplicate, and degradation evidence across capability adapters | No unchecked duplicate writes for anonymous submit, payment callback, or AI usage |

## Reviewer Checklist

- [ ] Every capability action declares owner/token/resource scope before provider
  or persistence adapters are called.
- [ ] Every mutating capability action has an `idempotency_key` plan.
- [ ] Every event-capable action has a `correlation_id` plan.
- [ ] Security-sensitive events explicitly forbid raw share tokens, token
  hashes, owner email, full private notes, and full handoff text.
- [ ] CatCare-only fields stay in product services; common packages receive
  generic contracts and redacted properties only.
- [ ] Cloudflare + Hono portability is preserved by app-layer filters, not only
  Supabase RLS.
