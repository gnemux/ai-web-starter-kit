# GNE-250 Deployed CatCare Smoke Verification

## Conclusion

Result: `pass with non-blocking concerns` for the final MVP3 deployed-product
smoke. The stable Vercel URL ran the current package-consuming CatCare journey
from owner setup through plan publication, private-link submission, owner
result review, mock AI recap, Supabase facts, and PostHog observation.

The run did not change application code, schema, migrations, provider
configuration, or live-provider settings. It created only `GNE250`-named
reference/staging/test product data through the deployed UI.

## Baseline

| Evidence | Result |
| --- | --- |
| Stable URL | `https://ai-web-starter-kit-web.vercel.app` |
| Deployed commit | `d7bfeb644f3ff7f2ab6a79ceb03fb3de19ff6565` |
| GitHub CI | [Run 29218432852](https://github.com/gnemux/ai-web-starter-kit/actions/runs/29218432852): success |
| Vercel commit status | `success`: `Deployment has completed` |
| Stable URL response | HTTP 200; response region `sin1` |
| Root / web version | `0.1.0` / `0.1.0` |
| Reusable packages | `@xwlc/core`, `@xwlc/db`, `@xwlc/platform`, and `@xwlc/ui` at `0.1.1` |
| Schema contract | `catcare-mvp3` |
| Repository/cloud migrations | 17/17; head `20260712122026_restrict_public_cat_photo_listing` |
| Migration in this task | none; no migration was needed |

Vercel labels the automatic `main` deployment as Production. MVP3 still uses
the single reference/staging/test Supabase project and one PostHog project; no
separate production provider environment is claimed.

## Deployed Journey

| Step | Status | Fresh evidence |
| --- | --- | --- |
| Landing and login/session | pass | `/` loaded; the existing reviewer session opened `/catcare`; logout later returned to the signed-out landing page. |
| Owner cat | pass | Created `GNE250 部署验收猫` through `/catcare/cats/new`. |
| Reusable routine | pass | Saved the default six enabled routine definitions for the GNE-250 cat. |
| Plan generation | pass | Mock AI generated one one-day plan with six task definitions and seven scheduled executions; entitlement display changed from 17/65 to 16/65. |
| Publish | pass | Plan `a50b626c-8c5e-465e-b292-948587eb86cc` published for 2026-07-13. |
| Private link | pass | Generated and copied one private URL; evidence records only `/s/<redacted>`. |
| Token route | pass | After explicit logout, a fresh active link in a new tab displayed `匿名访问`, only the authorized cat/date/task projection, and no owner navigation. |
| Anonymous submission | pass | The signed-out tab submitted one required result and changed to `已全部提交`. Supabase recorded one submission plus `actor_type=anonymous_token` view/submission Audit rows. |
| Owner result | pass | Owner result showed `真实提交`, 1/6 completed, five missing, and no abnormal note. |
| Mock AI recap | pass | Generated the recap from the real 1/6 result; entitlement display changed from 16/65 to 15/65. |
| Billing/usage surface | pass in test boundary | `/account/usage` showed 15/65 and `/account/billing` explicitly stated that current orders and payments are test data with no real charge. |
| Browser diagnostics | pass | No warning or error console messages were observed on the tested journey. |

## Supabase Trusted Facts

Read-only SQL through the connected Supabase project returned:

- plan status `reviewed`, generation source `ai_mock`, and service date
  2026-07-13;
- six task definitions and one non-abnormal submission with an idempotency key;
- one `care_plan_published` and one `share_link_created` Audit row from the
  owner actor;
- two `share_page_viewed` rows and one `care_submission_created` row from the
  `anonymous_token` actor;
- correlation IDs on every listed Audit row and an idempotency key on the
  submission Audit row;
- one pending `owner_notification` Outbox row with both correlation and
  idempotency keys;
- one committed `catcare_plan_generation` usage row and one committed
  `catcare_result_recap` row, each linked to one Credit-ledger row.

The independent signed-out active-link proof used a separate published
one-task GNE-250 plan. Trusted facts for that plan show one submission with an
idempotency key, two `share_page_viewed` and one `care_submission_created`
Audit rows from `anonymous_token`, correlation IDs on those Audit rows, and one
pending owner-notification Outbox row with correlation and idempotency keys.

Supabase, not the browser or PostHog, is the source of truth for these facts.
The cloud RLS/access contract was not broadly rerun in GNE-250; this smoke
consumes the accepted owner/anonymous/token matrix in
[`security-negative-verification.md`](security-negative-verification.md) and
adds the fresh signed-out deployed-route proof above.

## PostHog Observation

Project `476986` received these fresh `env=production` events after
2026-07-13 02:00 UTC:

| Event | Fresh count |
| --- | ---: |
| `catcare_cat_created` | 1 |
| `catcare_routine_saved` | 1 |
| `catcare_plan_created` | 1 |
| `catcare_plan_published` | 1 |
| `catcare_share_link_created` | 1 |
| `catcare_share_page_viewed` | 1 |
| `catcare_results_opened` | 1 |
| `ai_request_completed` | 2 |
| `catcare_submission_created` | 0 |

The fresh share-view event and both AI completion events all had `app`, `env`,
`module`, `mvp_stage`, `market`, `version`, and `correlation_id`. The table
records the original GNE-250 run: the trusted submission, Audit, Outbox, result
page, and Credit/usage facts passed, but that run did not produce a fresh
submission event. The later GNE-266 repair verification below closes this
specific observability gap without rewriting the historical result.

## GNE-266 Reliable-Delivery Repair Verification

The repaired server Analytics delivery path was merged by
[PR #89](https://github.com/gnemux/ai-web-starter-kit/pull/89) as commit
`82e918794350c53a8bc9a828050420f42e74c86b`. GitHub CI run
[29224603456](https://github.com/gnemux/ai-web-starter-kit/actions/runs/29224603456)
passed, and Vercel reported `Deployment has completed` at
2026-07-13 04:45:34 UTC.

A fresh one-day plan used the existing deployment-test cat and mock AI in the
shared reference/staging/test environment. The run consumed one test AI quota,
created plan `8e84b9b1-7d82-4b20-b2f5-8c056b137a66`, published it, generated a
new private link, opened the authorized anonymous projection, and submitted
one completed result. The anonymous page changed from `0/6` to `1/6`; the
Owner result page showed one real completion, five missing items, and the test
note. No live Provider, payment, schema, migration, or environment change was
used.

PostHog project `476986` received both required events for that plan:

| Event | UTC timestamp | Correlation ID | Result |
| --- | --- | --- | --- |
| `catcare_share_page_viewed` | 2026-07-13 04:59:41 | `a3dfb4f1-91b0-4963-8829-2f99ff30a503` | `success`, `valid` |
| `catcare_submission_created` | 2026-07-13 05:00:32 | `1aa1180a-7a0f-43ab-934d-975d586c5909` | `created` |

The submission event carried `request_source=catcare_anonymous_submit`,
`provider=posthog`, `resource_type=care_plan`, and the expected shared test
environment properties. Its URL property was
`https://ai-web-starter-kit-web.vercel.app/s/[redacted]`; no raw share token or
private note reached the queried Analytics properties.

Read-only Supabase verification found one non-abnormal completed submission,
the matching `anonymous_token` `share_page_viewed` and
`care_submission_created` Audit rows, and one pending Owner-notification
Outbox row. The submission Audit row, Outbox row, and PostHog submission event
all shared correlation ID `1aa1180a-7a0f-43ab-934d-975d586c5909`; the trusted
submission, Audit, and Outbox also shared the same idempotency key. This proves
the repaired deployed path reaches PostHog while preserving the business,
Audit, and Outbox facts.

## Security And Lifecycle Notes

- No password, private identity, raw share token, token hash, private note,
  provider secret, or raw provider payload is stored in this record.
- The initial owner journey exercised the public route and one submission, but
  that browser still had an Owner session. It is not counted as signed-out
  proof even though trusted Audit used the `anonymous_token` actor.
- A separate synthetic GNE-250 account and one-task published plan were then
  prepared in the shared reference/staging/test environment. The account was
  explicitly logged out before a new tab opened the active link and submitted.
  Trusted data shows one idempotent submission, anonymous-token view/submission
  Audit rows, and one pending owner-notification Outbox row with correlation and
  idempotency keys.
- After Owner result review and mock recap, the original link had also changed
  to `已关闭`, exposed no care content, and had no owner navigation. The broader
  signed-out active/expired/revoked/tampered matrix remains the GNE-270 evidence.

## Explicit Not Run

| Item | Reason | Risk / later treatment |
| --- | --- | --- |
| Live AI provider | MVP3 uses mock/no-op/sandbox/test only | Non-blocking for MVP3; mandatory before enabling a live AI provider |
| Live payment/refund/settlement | No real-money operation is authorized or needed | Non-blocking for MVP3; mandatory before the first real charge |
| Real downstream Outbox delivery | No Email/SMS/notification provider is configured | Non-blocking while the product does not promise delivery |
| Separate production Supabase/PostHog | MVP3 has one shared reference/staging/test provider environment | Non-blocking for MVP3; mandatory before real users or live-provider operations |

## Final Assessment

The package-consuming application, deployed runtime, current cloud schema,
owner/anonymous service boundary, Audit/Outbox, Billing/Credit, mock AI, and
PostHog operate together on the stable online test environment. The original
GNE-250 run missed the fresh submission event; the deployed GNE-266 repair
rerun received both share-view and submission events with matching trusted
correlation evidence. The explicit production-provider `not_run` boundaries
remain unchanged.
