# GNE-272 MVP3 Evidence Index

## Executive Summary

GNE-272 has enough durable evidence to hand the factual record to the later
v0.3.0 decision. The deployed CatCare journey, owner/anonymous security
boundary, package consumption, database upgrade, Billing/AI facts, Audit,
Outbox, PostHog, GitHub CI, and Vercel deployment are each backed by a named
owner issue, a repository record, or a live read-only query.

This index is not the v0.3.0 Go / Conditional Go / No-Go decision. GNE-250 now
records the final deployment-environment smoke in
`deployed-smoke-verification.md`. Counts below are snapshots, not product KPIs
or promises about a separate production environment.

## Evidence Scope And Definitions

- Snapshot date: 2026-07-13, Asia/Shanghai.
- PostHog window: trailing 30 days at query time.
- Supabase snapshot: point-in-time read-only aggregates from the single shared
  reference/staging/test project `nglilxhkuqzswbwitbdu`.
- Online application: the stable Vercel test URL
  `https://ai-web-starter-kit-web.vercel.app`.
- Git baseline before this evidence-only change:
  `16469c54d7351cb526febfe622ed78d4cf1de621`.
- Accepted post-repair runtime baseline:
  `82e918794350c53a8bc9a828050420f42e74c86b` from PR #89.
- Accepted post-repair evidence baseline:
  `55553d3a2270b3405eeb2e1550dbcc521bcdb815` from PR #90.
- Vercel calls the automatic `main` target `Production`, but MVP3 has no
  separate production Supabase or PostHog environment. This report therefore
  uses `online validation` or `reference/staging/test` for product claims.
- PostHog is observational. Supabase service/database facts remain the trusted
  source for orders, entitlements, usage, Credit, Audit, Outbox, and product
  state.

## Complete CatCare Journey

| Journey stage | Result | Durable evidence |
| --- | --- | --- |
| Product landing and login | Pass | `reviewer-runbook.md` records `/` loading, signed-out `/catcare` redirecting to `/login?next=%2Fcatcare`, and successful owner entry. |
| Owner workspace and cat | Pass | The runbook records the owner workspace and creation of the isolated GNE-269 test cat. |
| Routine, plan, tasks, publish | Pass | The runbook records routine recovery, a published plan, 6 task definitions, and 7 scheduled executions. |
| Private-link handoff | Pass | The runbook records a fresh link and minimum anonymous projection; raw bearer material is excluded. |
| Anonymous submission | Pass | The runbook records one safe completion and the public visit changing from 0/3 to 1/3. |
| Owner result | Pass | The owner page showed one real completion out of six, five missing results, and the persisted recap. |
| AI and entitlement | Pass in mock/test boundary | Plan generation and result recap each consumed one product use through the trusted entitlement/usage/Credit path. |
| Paywall and checkout | Pass in sandbox/test boundary | Existing Pro entitlement allowed generation; the separate Credit-pack flow has a verified Creem Test Mode order and idempotent grant. |
| Responsive capacity | Pass for tested data | Desktop/mobile runbook checks found no horizontal overflow; long result detail uses a bounded summary. |

`reviewer-runbook.md` is the primary journey record. Later security and database
documents supersede its historical 11/16 migration warning; the current state
is 17/17 as recorded below.

## Supabase Product And Access Facts

| Fact | Current result |
| --- | ---: |
| Cats | 3 |
| Care plans | 5: 1 published, 3 reviewed, 1 closed |
| Care tasks | 83 |
| Care submissions | 25 |
| Share tokens | 18: 2 active, 16 revoked |

Owner A/B isolation, direct anonymous read/write rejection, token states,
regeneration, revocation, tampering, field whitelist, and submission
idempotency are recorded in `security-negative-verification.md`. GNE-271 added
Storage evidence: the public object-delivery contract remains available while
anonymous metadata listing is blocked and authenticated access is UUID-folder
scoped.

The evidence contains no password, owner identity, raw share token, token hash,
private handoff text, or private care note.

## Billing, Order, Entitlement, And AI Facts

| Fact | Current result |
| --- | ---: |
| Billing orders | 30 |
| Paid orders | 26: 14 Creem Test Mode, 12 sandbox |
| Negative order states | 3 sandbox canceled, 1 sandbox failed |
| Entitlements | 20: 9 active, 11 expired; all AI quantity rows use `credit` |
| Usage rows | 80: 41 committed, 39 released |
| Credit ledger | 77: 19 grants, 58 consumes |

The representative Test Mode order `2c64812f…` is still `paid` for USD 9.00
and links to exactly one active 100000-credit entitlement and one
100000-credit grant. Result-page navigation is not treated as payment proof;
the order, entitlement, and ledger rows are the trusted facts.

CatCare AI usage is traceable without prompt or result content:

| Purpose | Status | Rows | Linked Credit rows | Total Credit |
| --- | --- | ---: | ---: | ---: |
| Plan generation | committed | 7 | 7 | 70,000 |
| Result recap | committed | 26 | 26 | 260,000 |
| Result recap | released | 2 | 2 | 20,000 |

The active provider boundary remains mock/no-op/sandbox/test. Live provider
quality, real provider cost, real payment settlement, refund, tax, and dispute
handling are not claimed by MVP3.

## Audit And Outbox Facts

| Evidence | Current result |
| --- | ---: |
| Audit events | 84 |
| Audit rows with correlation ID | 84 |
| Anonymous submission Audit rows | 8; all 8 have idempotency keys |
| Outbox events | 8 owner notifications |
| Outbox rows with correlation and idempotency keys | 8 |
| Outbox runtime state | all 8 pending |

Audit covers plan publication, share creation/revocation, anonymous views,
invalid/revoked token rejection, and anonymous submission. Audit idempotency is
not universal: deterministic idempotency applies to the 8 anonymous submission
effects; the other 76 historical/action Audit rows have correlation IDs but no
idempotency key. This index does not broaden that contract.

The Outbox lease/CAS/retry/dead-letter state machine has executable GNE-267
tests. The shared online environment has no real downstream notification
provider/worker delivery evidence, so pending rows prove durable enqueueing,
not message delivery.

## PostHog Observational Evidence

Active project: `ai-web-starter-kit`, project `476986`.

Saved dashboards:

- [XWLC MVP2 Core Analytics](https://us.posthog.com/project/476986/dashboard/1748902)
- [XWLC MVP2 AI Analytics](https://us.posthog.com/project/476986/dashboard/1748661)

Trailing-30-day named-event snapshot:

| Event | Count |
| --- | ---: |
| `catcare_page_viewed` | 494 |
| `catcare_plan_created` | 7 |
| `catcare_plan_published` | 3 |
| `catcare_share_link_created` | 4 |
| `catcare_share_page_viewed` | 9 |
| `catcare_results_opened` | 66 |
| `ai_request_started` | 71 |
| `ai_request_completed` | 57 |
| `ai_request_failed` | 4 |
| `quota_limit_reached` | 15 |
| `checkout_started` | 58 |
| `payment_succeeded` | 28 |
| `payment_failed` | 1 |
| `payment_canceled` | 4 |
| `entitlement_granted` | 28 |

Across these selected product/capability events, missing values for each of
`app`, `env`, `module`, `mvp_stage`, `market`, and `version` were zero. The 13
selected share events also had zero missing `correlation_id` values. The share
event schemas expose bounded context/resource/result fields and no raw-token,
token-hash, authorization, or bearer property.

PostHog event totals are not expected to equal database row totals one-for-one:
events include attempts, failures, repeated observations, and different time
windows. A PostHog success event never replaces the corresponding trusted
order, entitlement, usage, or Credit row.

The trailing-30-day table above is the original GNE-272 snapshot. A later
GNE-266 deployed repair rerun closed its missing-submission observation:

| Event | UTC timestamp | Safe result |
| --- | --- | --- |
| `catcare_share_page_viewed` | 2026-07-13 04:59:41 | `success`, `valid`, with correlation ID |
| `catcare_submission_created` | 2026-07-13 05:00:32 | `created`, with the same correlation ID as the trusted submission Audit and Outbox effect |

The queried submission event used the redacted `/s/[redacted]` URL and carried
no raw token or private note. `deployed-smoke-verification.md` owns the detailed
safe evidence. The original GNE-250 absence is historical and is no longer a
decision caveat.

The AI dashboard description still refers to the historical “Failure test
model”. Current formal guidance is stricter: failure evidence must come from a
service-level fixture, provider failure, or controlled test and must not expose
a dedicated failure-only model in the product UI. This stale dashboard copy is
non-blocking but should be corrected by the next Analytics maintenance pass.

## Package, Schema, GitHub, And Vercel Evidence

| Evidence | Result |
| --- | --- |
| Root / Web versions | `0.1.0` / `0.1.0` |
| Reusable packages | `@xwlc/core`, `@xwlc/db`, `@xwlc/platform`, `@xwlc/ui` are `0.1.1` |
| Consumption boundary | Web consumes public workspace exports; Travel root-import compile evidence passed in GNE-267 |
| Repository/cloud migrations | 17/17, head `20260712122026_restrict_public_cat_photo_listing` |
| Empty-database rebuild | Pass for all 17 migrations in the isolated GNE-271 rehearsal |
| Current accepted main CI | [Run 29225628666](https://github.com/gnemux/ai-web-starter-kit/actions/runs/29225628666): success for `55553d3` |
| Staging migration | [Run 29214674101](https://github.com/gnemux/ai-web-starter-kit/actions/runs/29214674101): success from `main`, `target=staging` |
| Vercel commit status | Success: `Deployment has completed` for `55553d3` |
| Stable URL | HTTP 200 on 2026-07-13; response region `sin1` |

PR #82 delivered the Storage policy forward migration; PR #83 delivered the
GNE-271 upgrade record. `package-db-upgrade-verification.md` is the detailed
source for ledger reconciliation wording, empty-database replay, cloud policy
checks, unchanged business aggregates, and forward-fix rollback boundaries.

## Evidence Ownership And Traceability

| Evidence area | Owner issue | Primary durable source |
| --- | --- | --- |
| Reviewer identities, URL, version baseline | GNE-268 | `reviewer-baseline.md` |
| Complete product journey | GNE-269 | `reviewer-runbook.md` |
| Owner/anonymous/token negative matrix | GNE-270 | `security-negative-verification.md` |
| Package patch and database upgrade | GNE-271 | `package-db-upgrade-verification.md` |
| Product/access/capability acceptance history | GNE-231 / GNE-232 / GNE-233 children | `acceptance.md`, capability/action and security specs |
| Cross-system evidence index | GNE-272 | This document |
| Final deployment smoke reproduction | GNE-250 | `deployed-smoke-verification.md` |
| Final v0.3.0 decision | GNE-273 | `v0.3.0-decision.md` |
| Product/Travel extension decision | GNE-274 | Not executed by GNE-272 |

## Not Run And Decision Caveats

| Item | Risk | Blocks GNE-272 | Required treatment |
| --- | --- | --- | --- |
| True production Supabase/PostHog isolation | Low for MVP3, high before real users | No | Not enabled in MVP3; create and migrate an isolated production environment before live users, real payment, or real AI cost. |
| Live AI provider quality/cost | Low for MVP3 | No | Remains a later provider gate; current evidence is mock/no-op/sandbox/test only. |
| Live payment, settlement, refund, tax, dispute | Low for MVP3, high before commerce | No | Remains under the production-payment gate; current orders are sandbox or Creem Test Mode. |
| Real Outbox message delivery | Medium | No | Queueing and worker logic are verified; configure a downstream provider and run delivery smoke before a real product promises notifications. |
| Leaked-password protection | Medium before public signup | No | Supabase Advisor still reports it disabled; enable before formal public-user launch. |
| `payment_events` RLS with no public policy | Informational | No | Intentional server/webhook-only boundary; do not add public policy merely to clear the Advisor info. |
| AI dashboard stale failure-model wording | Low | No | Correct dashboard description during Analytics maintenance; do not reintroduce a failure-only product model. |

## Future Product Handoff Gates

These are trigger-based handoff requirements, not fixed assignments to the
current MVP4/MVP5 issue numbers. Future planning may merge, rename, or replace
those issues. When Travel is formally scoped, map every triggered row to an
active issue with an owner and acceptance criteria.

| Capability | Becomes mandatory when | Future owner category |
| --- | --- | --- |
| Isolated Supabase/PostHog production environment | Before the first real user or live-provider operation | Travel Deployment / Environment |
| Supabase leaked-password protection | Before public signup opens | Travel Auth / Security |
| Live AI quality, cost, budget, rate limit, and degradation | Before enabling a live AI provider | Travel AI Production Gate |
| Real Outbox delivery | Before promising email, SMS, or notification delivery | Travel Notification / Async |
| Provider-free Outbox state machine and safe deterministic event-ID helper extraction | When Travel is the second consumer and would otherwise copy CatCare logic | Travel Platform Extraction |
| Live payment, refund, tax, and reconciliation | Before the first real charge | Travel Payment Production Gate |
| Stale AI/PostHog dashboard metadata | During the next Analytics maintenance pass | Analytics Maintenance |

GNE-274 may complete without creating every future issue in advance. A real
capability must not be enabled or described as ready until its triggered row is
mapped to a then-current issue. Untriggered rows stay deferred. The lack of a
public `payment_events` policy remains an intentional server/webhook-only
design and is not implementation work.

## Handoff To The Decision Issues

GNE-272 evidence coverage, the GNE-250 deployed smoke, the GNE-266
reliable-delivery repair, and the GNE-273 Go decision are now recorded.
`v0.3.0-decision.md` separates verified MVP3 facts, resolved follow-up
evidence, non-blocking concerns, `not_run`, and future production gates. The
original missing submission event is resolved; real Outbox delivery, live
providers, and true production isolation remain unclaimed future gates.

This handoff does not close GNE-234 and does not activate GNE-274 from the
GNE-273 execution thread.
