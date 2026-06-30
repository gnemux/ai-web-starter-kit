# GNE-278 Product Flow: CatCare Reference Product

## Purpose

GNE-278 is the PRODUCT-00 gate for CatCare. It defines the product journey,
page map, prototype corrections, and handoff boundaries before more GNE-231
implementation continues.

CatCare is a Reference Product used to validate the XWLC foundation through a
real early SaaS flow. It is not the old starter demo and it is not the final
MVP5 product.

Current product sentence:

```text
Fill the cat profile and daily care routine once. Before leaving, generate a
shareable temporary care checklist. The sitter completes it step by step, the
owner tracks results, and AI reviews abnormal signals and key takeaways.
```

Chinese product sentence:

```text
填一次猫咪档案和日常习惯，出门前一键生成可分享照护清单。
照看者按步骤完成，主人实时看结果，AI 自动复盘异常和重点。
```

PM correction:

CatCare must not be only a pre-trip tool. A competitive product also needs
lightweight daily records, so AI can generate better temporary-care checklists
from the cat profile, reusable routines, food/treat inventory, and recent
events.

## Source Prototypes

Reference folder:

`/Users/wangwei/Downloads/CatCare_上一版高保真原型_10屏_含Codex交接`

Accepted as visual direction:

- `01_产品首页_Landing.png`
- `02_登录_Register_Login.png`
- `03_主人工作台_Dashboard_Empty.png`
- `04_创建猫咪档案_Cat_Profile.png`
- `05_创建照护计划_Care_Plan_Builder.png`
- `06_计划详情与分享_Plan_Detail_Share.png`
- `07_照看者查看与提交_Public_Sitter_View.png`
- `08_结果查看与AI付费点_Results_Paywall.png`
- `09_账单与权益_Billing_Entitlements.png`
- `10_异常与边界状态_Error_Boundary_States.png`

Generated GNE-278 flow board:

- v1: `specs/reference-product/prototypes/catcare-gne-278-flow-board-v1.png`
- v2: `specs/reference-product/prototypes/catcare-gne-278-flow-board-v2.png`
- paid states: `specs/reference-product/prototypes/catcare-gne-278-paid-user-states-v3.png`
- current v6: `specs/reference-product/prototypes/catcare-gne-278-flow-board-v6.png`

Current implementation guidance should follow v6 plus this Markdown spec. Older
boards are historical references.

## Prototype Review

Keep:

- Product-first CatCare brand and visual system.
- Landing, login/register, authenticated default workspace, and billing entry
  must already be in CatCare product context before PRODUCT data issues can be
  accepted. The data issue may not own high-fidelity implementation, but it
  cannot be reviewed against generic starter/demo pages.
- Owner-side left navigation: 工作台, 猫咪档案, 照护计划, 结果查看, 账单与权益.
- Anonymous sitter page without owner navigation.
- AI summary as the best MVP3 paywall trigger.
- Sandbox/test visibility on billing and payment states.

Correct:

- The dashboard must have both empty and active states.
- Cat profile creation must clearly separate MVP required, optional, and later
  fields. Optional health details must not block saving.
- Cat profile and daily care routine must be separate. The profile identifies
  the cat; the routine captures reusable feeding, water, litter, medicine, play,
  and environment habits.
- The product action is not "manually create a care plan from scratch". The
  user sets routine data, selects a temporary-care scenario, and the system
  generates a checklist that can be reviewed and published.
- Share links need explicit states: not generated, generated, revoked, expired.
- Sitter submission needs a success state and duplicate-refresh-safe state.
- Results need AI gated, AI failed, and AI generated states.
- Billing must show Free and Pro states separately. Pro users must not see an
  upgrade-to-Pro CTA.
- Account/Billing/Usage are shared capabilities in CatCare context, not a
  separate duplicated billing system.
- Paid state must appear where value is consumed: dashboard, routine AI
  optimization, generated checklist, private share, owner results, and billing.
  It must not appear on the anonymous sitter page.

Do not copy literally:

- Prototype small text, dates, plan IDs, and sample prices are placeholders.
- Upload controls are visual only for MVP3 unless a later issue explicitly
  adds storage.
- The error/boundary screen is a component-state spec, not necessarily a
  public production route.

## Business Journey

```text
/ product landing
-> /login register or sign in
-> onboarding dashboard
-> create cat profile
-> set reusable daily care routine
-> choose temporary-care scenario and dates
-> system generates temporary care checklist from routine
-> owner reviews / edits / publishes checklist
-> owner generates / copies / revokes private link
-> anonymous sitter views minimum required care details
-> anonymous sitter completes checklist with autosaved progress
-> anonymous sitter submits final result
-> owner views result
-> owner requests AI review
-> entitlement / credit check
-> paywall / sandbox checkout if needed
-> order / entitlement / credit update
-> return to original plan results
-> continue AI review
```

## Page Map

| Route | Active nav | Purpose | Owner |
| --- | --- | --- | --- |
| `/` | none | Product landing, value, flow, pricing, CTA. | PRODUCT |
| `/login` | none | CatCare auth context, default return to `/reference-product`. | PRODUCT + Auth |
| `/reference-product` | 工作台 | Empty and active owner dashboard. | PRODUCT |
| `/reference-product/cats` | 猫咪档案 | Cat list and entry to create/edit. | PRODUCT |
| `/reference-product/cats/new` | 猫咪档案 | Create a cat profile. | PRODUCT |
| `/reference-product/cats/[id]` | 猫咪档案 | View/edit a cat profile. | PRODUCT |
| `/reference-product/routines` | 日常习惯 | Routine list and templates. | PRODUCT |
| `/reference-product/routines/[cat_id]` | 日常习惯 | Reusable daily care routine for a cat. | PRODUCT |
| `/reference-product/events` | 日常记录 | Lightweight daily events across cats. | PRODUCT |
| `/reference-product/events/new` | 日常记录 | Add feeding, treat, health, behavior, or environment event. | PRODUCT |
| `/reference-product/items` | 食物用品 | Food, treats, medicine, litter, and care item inventory. | PRODUCT |
| `/reference-product/plans` | 照护计划 | Plan list across draft, published, reviewed, closed. | PRODUCT |
| `/reference-product/plans/new` | 照护计划 | Scenario/date selection and generated checklist review. | PRODUCT |
| `/reference-product/plans/[id]` | 照护计划 | Plan detail, publish state, share entry. | PRODUCT, ACCESS entry |
| `/reference-product/plans/[id]/results` | 结果查看 | Owner sees submissions and AI paywall/generation entry. | PRODUCT, CAPABILITY entry |
| `/account` | 账单与权益 | Shared account profile in product context. | Shared capability |
| `/account/billing` | 账单与权益 | Shared billing, sandbox checkout, entitlement facts. | Shared capability |
| `/account/usage` | 账单与权益 | Shared AI Credit and usage ledger facts. | Shared capability |
| `/s/[token]` | none | Anonymous sitter minimum view and submit. | ACCESS |
| `/demo` | none | Foundation demo entry only. | Demo |
| `/demo/login` | none | Demo auth shell, default return to `/dashboard`. | Demo + Auth |
| `/dashboard` | none | Foundation demo workspace only. | Demo |

## Bilingual UI Requirement

CatCare must support Chinese and English. MVP3 may keep Chinese as the primary
copy for local review, but route-level screens and major actions need English
equivalents available through the existing i18n layer.

Prototype rule:

- Screen titles use Chinese + English, for example `喂养习惯 / Recurring Routine`.
- Main CTAs should have English equivalents in the copy map.
- The authenticated header should expose a language switcher such as `中 / EN`.
- Do not hard-code CatCare product copy only in JSX when the app already has an
  i18n pattern.

## Interaction Flow

Fast activation path:

```text
Landing
-> Login/Register
-> Cat profile
-> Recurring routine
-> Scenario and AI inputs
-> AI generate and checklist review
-> Private share
-> Sitter completes checklist
-> Owner results / AI review / paywall
```

This is the required first-run path. It should take minutes, not a long setup
session. Food/care items and event history improve AI quality and retention,
but they are not hard blockers for the first generated checklist.

Full product loop:

```text
Landing
-> Login/Register
-> Onboarding dashboard
-> Cat profile
-> Recurring routine
-> Food and care items
-> Event and health timeline
-> Scenario and AI inputs
-> AI generate and checklist review
-> Private share
-> Anonymous sitter checklist
-> Owner results / AI review / billing
```

Primary button handoff:

| From | Button | To |
| --- | --- | --- |
| Landing | Start checklist | Login/Register |
| Landing | View sample | CatCare sample checklist, not `/demo` |
| Login/Register | Login / OAuth success / verified email | Onboarding dashboard |
| Onboarding | Add cat | Cat profile |
| Cat profile | Save and set routine | Recurring routine |
| Recurring routine | Save routine | Food and care items |
| Food and care items | Save items | Event and health timeline |
| Event timeline | Add event / Continue | Scenario and AI inputs |
| Scenario inputs | Generate with AI | AI generate and checklist review |
| Checklist review | Publish | Private share |
| Private share | Copy link | Anonymous sitter checklist |
| Sitter checklist | Submit result | Owner results |
| Owner results | Upgrade / Buy credits / Generate AI review | Billing or AI review continuation |

Always-on safe actions:

- Back.
- Save draft.
- View sample checklist.

Conditional actions:

- Generate with AI: enabled only after cat profile, routine, and scenario are
  ready. Food/items and events improve quality but are not hard blockers.
- Publish: enabled only after required generated tasks are reviewed.
- Copy link: enabled only after publish and active link generation.
- Submit result: enabled only after required sitter tasks are done or marked as
  issue.
- Upgrade Pro / Buy credits: visible only when entitlement or credit is
  insufficient.

Mutually exclusive controls:

- Auth method: Google, Apple, or email flow.
- Scenario: business trip, weekend away, friend visit, or other.
- Frequency choice: daily, weekly, every two days, or custom.
- Sitter task status: done or issue.
- Link state: active, revoked, or expired.
- User paid state: Free, Pro, or Free with one-time credit pack.

Menu active rules:

- `/reference-product`: 工作台 / Dashboard.
- `/reference-product/cats*`: 猫咪档案 / Cat Profile.
- `/reference-product/routines*`: 喂养习惯 / Recurring Routine.
- `/reference-product/items*`: 食物用品 / Food & Care Items.
- `/reference-product/events*`: 事件记录 / Events.
- `/reference-product/plans*`: 照护计划 / Care Plans.
- `/reference-product/plans/[id]/results`: 结果查看 / Results.
- `/account`, `/account/billing`, `/account/usage`: 账单权益 / Billing.
- `/s/[token]`: no owner navigation.

PM self-review:

- The first-run path is intentionally shorter than the full data loop.
  Requiring events and item inventory before first checklist generation would
  hurt activation.
- Routine and events are intentionally separate. Routine is repeated work;
  events are dated facts such as illness, medicine, hospital visits, trips, and
  ad-hoc canned food.
- Food/care items are separate from both routine and events so reusable product
  names can feed AI generation without duplicating text.
- Paid status appears where value is consumed, not only on Billing.
- Anonymous sitters never see paid status or owner account data.
- The old foundation `/demo` stays internal and is not a product CTA.

## Page States

| Page | Required states |
| --- | --- |
| Landing | default, signed-in CTA, pricing state, broken demo link fallback |
| Login | loading, invalid credentials, signup success, auth provider disabled, next preserved |
| Dashboard | no cat, cat but no plan, active plans, pending results, service error |
| Cats | empty, list, create/edit success, validation error, forbidden |
| Daily routine | no routine, template selected, routine saved, AI optimization gated, service error |
| Daily event | quick add, saved, edit/delete, severity watch/urgent, service error |
| Food/care items | empty, manual item saved, scan/OCR placeholder, user-confirmed item, service error |
| Plan generator | blocked with no cat/routine, scenario selected, checklist generated, publish ready, publish blocked, service error |
| Plan detail | draft, published/no link, link generated, link revoked, link expired, forbidden |
| Anonymous sitter | valid token, PIN required, progress autosaved, expired, revoked, tampered, already submitted, submit error |
| Results | no submissions, normal submissions, abnormal submissions, AI review gated, AI review generated, AI failed |
| Billing/usage | Free, Pro active, payment pending, payment canceled, payment success, entitlement updating |
| Boundary states | unauthenticated, forbidden, expired/revoked link, duplicate submit, payment failed, AI failed |

## Cat Profile Fields

MVP required:

- `name`
- `life_stage` or `age_band`
- `care_notes`

MVP optional:

- `sex`
- `neutered_status`
- `weight`
- `temperament_notes`
- `diet_notes`
- `medication_notes`
- `allergy_notes`
- `emergency_contact_name`
- `emergency_contact_phone`
- `vet_or_clinic`

Later:

- Photo upload / storage.
- Vaccination and medical records.
- Attachments.
- Multi-owner household.
- Sitter-specific visibility rules.

## Daily Routine And Care Checklist Model

Routine:

- `owner_id`
- `cat_id`
- `title`
- `is_default`
- `source`: `manual`, `template`, `ai_assisted`
- timestamps

Routine item:

- `routine_id`
- `category`: `feeding`, `water`, `litter`, `play`, `medicine`,
  `environment`, `other`
- `title`
- `frequency`
- `time_of_day` or `time_window`
- `instructions`
- `enabled`
- `sort_order`

Food and care item:

- `owner_id`
- `cat_id`
- `name`
- `item_type`: `dry_food`, `wet_food`, `treat`, `medicine`, `litter`,
  `supplement`, `other`
- `default_amount`
- `default_frequency`
- `instructions`
- `visible_to_sitter`

Daily event:

- `owner_id`
- `cat_id`
- `event_type`: `feeding`, `treat`, `litter`, `behavior`, `health`,
  `medicine`, `environment`, `owner_away`, `other`
- `title`
- `note`
- `related_item_name`
- `severity`: `normal`, `watch`, `urgent`
- `occurred_at`

MVP3 supports manual food/treat/item entry and lightweight daily events. Real
barcode lookup, package OCR, nutrition extraction, and medical inference are
not MVP3 scope. If scan/OCR is shown in prototype UI, it is a future-state
placeholder and must require owner confirmation before any feeding amount or
medicine instruction is saved.

AI generation input:

- Cat profile.
- Daily routine.
- Food and care items.
- Recent daily events.
- Temporary-care scenario and dates.
- Owner notes.

Generated tasks should expose a source label such as `routine`, `recent_event`,
`owner_note`, or `ai_suggestion` so the owner can judge why a task exists.

Plan/checklist:

The plan is a temporary care checklist generated from a routine and scenario.
Tasks are snapshots. Editing a routine later must not silently mutate a
published checklist.

Plan:

- `owner_id`
- `cat_id`
- `routine_id`
- `title`
- `scenario`: `business_trip`, `weekend_away`, `friend_visit`,
  `hospital_care`, `other`
- `status`: `draft`, `published`, `reviewed`, `closed`
- `start_date`
- `end_date`
- `handoff_notes`
- `published_at`
- `closed_at`

Task:

- `plan_id`
- `category`: `feeding`, `water`, `litter`, `play`, `medicine`,
  `environment`, `other`
- `title`
- `instructions`
- `time_of_day` or `time_window`
- `frequency`
- `is_required`
- `sort_order`
- `enabled`

Submission:

- `plan_id`
- `task_id`
- `status`
- `note`
- `abnormal_flag`
- `submitted_at`
- `idempotency_key`

Sitter task progress:

- `plan_id`
- `task_id`
- `share_token_id`
- `status`: `todo`, `done`, `issue`
- `note`
- `saved_at`

Progress autosaves per task. Final submission is idempotent and summarizes the
saved progress.

## Share Link State Machine

```text
not_generated
-> generated
-> revoked
-> expired
```

Regenerate creates a new raw token and token hash, and invalidates the previous
active token.

Rules:

- Store only token hash.
- Show raw token only once.
- Do not log raw token.
- Do not send raw token to PostHog, Linear, screenshots, or PR evidence.
- Anonymous token is not an auth identity.

## Anonymous Minimum Surface

Visible to sitter:

- Cat display name and safe care descriptors.
- Plan date range and task schedule.
- Task titles, time windows, and instructions.
- Required care notes.
- Link expiry status.

Hidden from sitter:

- Owner email and account data.
- Billing, entitlement, and usage data.
- Internal IDs.
- Full medical history.
- Other cats and other plans.

Submission whitelist:

- Per-task completion status.
- Optional task note.
- Overall note.
- Abnormal flag.
- Optional sitter display label.
- Idempotency key.

## AI / Billing Return Flow

```text
owner opens results
-> click AI review
-> server checks entitlement / credit
-> if allowed: reserve or consume credit and generate review
-> if blocked: show paywall
-> sandbox checkout
-> order recorded
-> entitlement / credit updated
-> return to original plan results
-> continue the same AI review action
```

The checkout result page must not become the product endpoint. The product
endpoint is still the original plan results page.

## Event And Evidence List

PostHog events:

- `catcare_landing_viewed`
- `catcare_cat_created`
- `catcare_routine_started`
- `catcare_routine_saved`
- `catcare_daily_event_saved`
- `catcare_care_item_saved`
- `catcare_scenario_selected`
- `catcare_checklist_generated`
- `catcare_plan_created`
- `catcare_plan_published`
- `catcare_share_link_created`
- `catcare_share_link_revoked`
- `catcare_sitter_link_opened`
- `catcare_sitter_submission_created`
- `catcare_results_viewed`
- `catcare_sitter_task_progress_saved`
- `catcare_ai_review_requested`
- `catcare_ai_review_gated`
- `catcare_paywall_viewed`
- `catcare_checkout_started`
- `catcare_entitlement_granted`
- `catcare_credit_consumed`

Audit facts:

- Plan published.
- Share token created, revoked, expired access rejected.
- Anonymous submission accepted.
- Duplicate anonymous submit rejected.
- Permission denied.
- AI entitlement check.
- Order, entitlement, and credit changes.

Outbox facts:

- Share event.
- Owner notification after sitter submit.
- Entitlement update notification.

Usage ledger facts:

- Credit grant.
- Credit reserve / consume / release.
- No negative balance.
- Idempotent duplicate handling.

## Issue Boundaries

PRODUCT:

- Product journey, page map, owner shell.
- Owner data model.
- Owner cat / routine / generated checklist / result surfaces.
- Owner-only RLS and seed.
- Product page events.

ACCESS:

- Share token model.
- Anonymous view.
- Anonymous submit.
- Token expiry, revocation, replay, and negative tests.

CAPABILITY:

- Audit.
- Outbox.
- AI summary.
- Billing / Paywall / Sandbox Checkout.
- Order / Entitlement / Credit.
- PostHog cross-capability correlation.
- Future content-generation monetization from accumulated daily events.

VERIFY:

- Reviewer runbook.
- Deployment smoke after PRODUCT + ACCESS + CAPABILITY.
- Supabase / Vercel / GitHub CI / PostHog evidence.
- Final v0.3.0 conclusion.

## MVP3 Non-goals

- Live payment.
- Live AI provider dependency.
- Real file upload or storage.
- Real barcode lookup or package OCR.
- Nutrition database integration.
- Complete medical record product.
- Automated medical-risk diagnosis or medicine-dosage generation.
- Veterinary, ecommerce, community, or support modules.
- Native mobile app.
- Complex organization RBAC.
- Real email/SMS provider delivery.
- Cloudflare + Hono adapter implementation.
- Tax, refund, invoice, settlement, dispute handling.

## Paid User Surface Requirements

Paid status must be visible where it changes product value:

- Dashboard: Pro badge, multiple cats/plans, remaining AI credits, reuse
  previous checklist.
- Daily routine: saved routine templates and AI optimization entry.
- Generated checklist: AI optimization available, no paywall for Pro-included
  allowance.
- Private share: multiple sitter links and optional PIN if enabled.
- Results: AI review available/generated; no upgrade-to-Pro CTA for Pro users.
- Billing: Pro shows active plan and manage subscription, not upgrade-to-Pro.
- One-time credit buyer: still Free plan, but AI credits are available and the
  return action continues the original AI review.

Paid status must not be visible to anonymous sitters.

Pricing display standard:

- MVP3 CatCare pricing uses USD by default because the Reference Product is
  validating an overseas-ready SaaS flow.
- Prototype prices are placeholders, but currency signs must be `$`, not `¥`.
- Billing copy must clearly say sandbox/test checkout during MVP3.
- Tax, FX conversion, regional pricing, refunds, invoices, settlement, and
  disputes are not MVP3 scope.

PM guardrail:

- USD-only is acceptable for MVP3 and an overseas-first product.
- USD-only would be a weak choice for a China-first product; that belongs to a
  later domestic-mode stage, not this Reference Product gate.
- Do not add multiple paid SKUs now. MVP3 should validate only Pro subscription
  plus one-time AI credit packs.
- A paid "memory/content recap" is product-valid but not MVP3 core. Daily
  events can later generate a text/video recap for sharing to domestic channels
  such as Moments, Xiaohongshu, Douyin, or overseas channels such as X and
  YouTube. Treat it as a future CAPABILITY/GROWTH monetization candidate after
  the care checklist, sitter submit, AI review, and Billing loop are proven.

## PRODUCT01 Page-Shell Gate

GNE-251 is a data-model issue, but its acceptance must be reviewed inside a
real CatCare product shell:

- `/` is CatCare Landing, not generic starter.
- `/login` is CatCare login/register and returns to `/reference-product`.
- `/reference-product` is the authenticated CatCare default workspace.
- `/account`, `/account/billing`, and `/account/usage` are visible as CatCare
  account/billing/usage capability entries.

High-fidelity owner workflow implementation remains GNE-252/GNE-253. The gate
here is that data-model verification cannot happen against mismatched demo UI.
