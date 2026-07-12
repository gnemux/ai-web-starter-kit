# MVP3 30-Minute Reviewer Runbook Result

## Scope

This is the execution record for `GNE-269`. It validates the deployed CatCare
journey and its evidence chain after the GNE-252 recovery fix. The run made only
the authorized product-flow writes needed for QA; it did not directly change
the database, migration history, payment state, or live AI configuration.
Status values are `pass`, `fail`, `blocked`, `concern`, and `not_run`.

Snapshot time: 2026-07-12 (Asia/Shanghai).

## Baseline

| Evidence | Result |
| --- | --- |
| Stable test URL | `https://ai-web-starter-kit-web.vercel.app` |
| Git commit | `ad6e33dae7f5a54501e2a6e6dc889cb34ab5f561` |
| Git relation | GNE-269 branch is fast-forwarded to local `origin/main`; deployed commit matches |
| GitHub CI | `pass`: `checks` completed with `success` |
| Vercel deployment | `pass`: GitHub commit status reported `Deployment has completed`; browser loaded the stable URL |
| Root / web package | `0.1.0` / `0.1.0` |
| Reusable packages | `@xwlc/core`, `@xwlc/db`, `@xwlc/platform`, and `@xwlc/ui` are `0.1.1` |
| Repository migrations | 16 files, latest `20260709013908_restore_ai_credit_units.sql` |
| Remote migration history | 11 rows, latest `20260708124436_add_outbox_idempotency_key` |

The Vercel deployment is the project's only online test environment. The word
`Production` in Vercel deployment metadata does not mean a separate production
Supabase or PostHog environment exists.

## Journey Result

| Runbook step | Status | Observed result |
| --- | --- | --- |
| Product landing `/` | `pass` | CatCare-first landing loaded and exposed the product flow, pricing, and `/login?next=/catcare` entry |
| Login page | `pass` | Email/password form loaded; signed-out `/catcare` redirected to `/login?next=%2Fcatcare` |
| Owner login and `/catcare` | `pass` | Reviewer owner session opened the CatCare workspace with three cats, four plans, 24 submissions, and active entitlement/usage summaries |
| Create cat | `pass` | Created `GNE269 验收猫`; the owner detail page persisted the profile and safe test note |
| GNE-252 recovery guard | `pass` | A valid 2026-07-12 submission for the no-routine test cat returned `plan_error=routine`, kept only that cat selected, showed the routine recovery CTA, consumed no AI unit, and created no plan |
| Create plan and tasks | `pass` | Saved enabled routines, then created plan `732fa833-f82a-41e4-8a57-99a5f8551afa` for 2026-07-12 with 6 generated task definitions and 7 scheduled executions |
| Publish and create private link | `pass` | Published the new plan and generated a fresh private link; the raw bearer URL is intentionally omitted |
| Anonymous private-link view | `pass` | Fresh token route explicitly displayed `匿名访问`, showed only authorized handoff content, one day/two visits/seven executions, and no owner navigation |
| Anonymous submission | `pass` | Submitted one safe `completed` result for the first visit; the public page changed from 0/3 to 1/3 and confirmed owner visibility |
| Owner result review | `pass` | Owner result page showed `真实提交`, 1/6 completed, five missing results, no abnormal note, and the submitted `主粮` result |
| AI entitlement / credit decision | `pass` | The same test plan consumed exactly one unit for generation (19/65 to 18/65) and one for its result recap (18/65 to 17/65); the recap was stored and displayed on the Owner result page |
| Paywall / sandbox checkout or existing entitlement | `pass` | Active Pro entitlement allowed generation; the add-on checkout opened in explicit Test Mode and no payment form was submitted |

The full private share URL and bearer token are intentionally excluded from
this record.

## Layout And Long-List Capacity

| Surface | Status | Evidence |
| --- | --- | --- |
| Anonymous task list, desktop | `pass` | 1280 px viewport; document width equaled viewport width; 17-task plan remained scannable |
| Anonymous task list, mobile | `pass` | 390 x 844 viewport; document width remained 390 px with no horizontal overflow |
| Owner food/item list | `pass` | 22 items were separated into eight categories; the selected category showed two editable cards without horizontal overflow at 390 px |
| Owner event list | `pass` | Cat filter and time/type/severity controls kept the populated timeline scannable at 390 px |
| Owner plan list | `pass` | Four plan cards separated one active and three historical plans; no horizontal overflow at 390 px |
| Owner results list | `pass` | Four result entries exposed submission/state summaries without horizontal overflow at 390 px |
| Owner result detail | `pass` | A 59-item overdue list displayed eight priority rows plus an explicit “51 more” summary instead of rendering an unbounded wall |
| Share/security history | `pass` | Existing plan displayed 13 audit records and share state without horizontal overflow at 390 px |

Current data volumes do not justify an immediate pagination implementation.
Category filters, state grouping, and bounded result-detail summaries keep the
tested owner surfaces scannable. Revisit pagination only when a real second
consumer or materially larger data set demonstrates a limit.

## Supabase Evidence

The connected cloud test project was queried read-only through the database
tool. No direct SQL write, migration, history repair, or seed was performed.
The authorized product-flow run itself created one clearly named test cat, one
published plan, one anonymous submission, and the matching AI usage/credit
consumption facts for plan generation and result recap, as recorded below.

| Safe aggregate | Count / result |
| --- | ---: |
| Cats | 3 |
| Care plans | 5 |
| Care tasks | 83 |
| Care submissions | 25 |
| Active share tokens | 4 |
| Billing orders | 30 |
| Active entitlements | 9 |
| Committed usage rows | 41 |
| Audit events | 73 |
| Outbox events | 8 |

Audit coverage included plan publication, submission creation, share-link
creation/revocation, anonymous page views, and invalid/revoked-token rejection.
All eight Outbox rows were still `pending`; this is recorded evidence, not a
Runbook implementation change.

The resumed GNE-269 run produced one published test plan, six task definitions,
one completed submission, and two committed usage/credit pairs: plan generation
and the same plan's result recap. For that plan, read-only facts show
`care_plan_published`, `share_link_created`, `share_page_viewed`, and
`care_submission_created` Audit events. The submission owns one correlated
`owner_notification` Outbox row in `pending` state with attempt count zero.
Audit actor types distinguish the owner actions (`user`) from public
view/submission (`anonymous_token`).

The stored mock recap matches the real 1/6 result: one completed item, no
exceptions, five unsubmitted items, and no overdue item. Its usage row is
`committed`, carries purpose `catcare_result_recap`, and links to exactly one
credit-ledger consume. The earlier unauthorized response created no usage row,
so the successful retry did not double-charge.

Schema-history parity is `fail`: the cloud test database has the runtime data
categories required by the journey, but its 11 recorded migrations do not
match the repository's 16 files. The final reconciliation and isolated empty-db
rehearsal belong to `GNE-271`.

## PostHog Evidence

The active project was verified as project `476986`, `ai-web-starter-kit`.
Over the previous 30 days, the connected project reported:

| Event | Count |
| --- | ---: |
| `catcare_page_viewed` | 472 |
| `catcare_plan_created` | 6 |
| `catcare_plan_published` | 2 |
| `catcare_share_link_created` | 1 |
| `catcare_share_page_viewed` | 5 |
| `catcare_results_opened` | 59 |

The representative anonymous-view event exposes the shared safe properties
`app`, `env`, `module`, `mvp_stage`, `market`, `provider`, `version`,
`correlation_id`, `resource_id`, `resource_type`, `request_source`, `outcome`,
and `result`. PostHog is observational evidence; Supabase server-side facts
remain the source of truth.

## Current Decision

Conclusion: `go` for the 30-minute Reviewer Runbook and closing `GNE-269`.
The GNE-252 recovery fix is merged and deployed; both the no-routine recovery
path and the post-routine owner-to-anonymous-to-owner journey passed. CI,
Vercel, responsive capacity checks, AI/Billing entitlement, PostHog, and
Supabase Audit/Outbox evidence are present within the stated test boundary.

The only remaining release-level concern is migration-history reproducibility.
It is assigned to GNE-271 and does not invalidate the current cloud test
journey. It must be resolved before the final v0.3.0 release conclusion.

## Resume Point

1. Close GNE-269 after the Runbook document, Linear description, tests, and
   independent documentation review agree.
2. Do not enter the next child issue from this runbook.
3. GNE-271 owns isolated empty-database replay plus cloud migration-history
   reconciliation before the final v0.3.0 decision.
