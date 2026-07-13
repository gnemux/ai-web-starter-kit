# Linear Tracking

## Project

- Name: `Web 端的可商用模板工程`
- Short ID: `98f7dceca282`
- Project UUID: `55cd8118-82ed-4c12-a977-f5b117d3a5e7`
- URL: <https://linear.app/gnemux/project/web-端的可商用模板工程-98f7dceca282>

## Project Milestones

```text
MVP1 基础底座
├── ID: 67415612-48ac-4769-b331-6b165d58a711
└── Parent issues: GNE-11, GNE-70, GNE-132, GNE-133, GNE-5, GNE-74

MVP2 扩展底座
├── ID: a1f0df17-7deb-4c42-ab93-f0afa3d5ce01
├── Parent issues: GNE-167, GNE-71, GNE-72, GNE-148, GNE-73
└── Consensus issue: GNE-190

MVP3 Reference Product：双底座架构与 Package 消费验证
├── ID: f85fc4d2-304b-406b-94aa-12f303b0acbc
└── Parent issues: GNE-228, GNE-229, GNE-230, GNE-231, GNE-232, GNE-233, GNE-234, GNE-298

MVP4 国内外双模式底座
├── ID: 5eed1508-a480-44d1-aa39-efebe17dd4f9
└── Parent issues: GNE-193

MVP5 真实海外垂直产品验证
├── ID: 347539e6-aee5-4a2d-a64c-189fa54720a6
└── Parent issues: GNE-201

MVP6 国内版真实落地
├── ID: 3a7c65e8-425f-4e26-a6bd-20d691662b61
└── Reserved milestone; detailed execution issues are not split yet.

LEGACY-M1 已并入 MVP1（不再使用）
├── ID: 2b98df48-1869-4005-aa90-bc1253405a04
└── Historical module milestone; do not assign new issues.

LEGACY-M2 已并入 MVP1（不再使用）
├── ID: f2796ef9-b542-48c6-8b69-2b464c7d43bf
└── Historical module milestone; do not assign new issues.

LEGACY-M3 已并入 MVP1（不再使用）
├── ID: d3a1e9b4-0472-4468-93e6-ae9d2ce3a110
└── Historical module milestone; do not assign new issues.

LEGACY-M4 已并入 MVP1（不再使用）
├── ID: cb6f022d-7dcc-4949-be42-30ba969ce4ff
└── Historical module milestone; do not assign new issues.

LEGACY-M7 已拆入 MVP1/MVP2/MVP3（不再使用）
├── ID: d9d0323d-1b92-4a9b-ada7-1e63d2599e2c
└── Historical module milestone; do not assign new issues.
```

Milestone display rule: assign MVP milestones only to module parent issues. Execution child issues should use `No milestone` and be reached through their parent issue. This keeps the Linear project milestone view focused on stage/module entry points instead of every implementation task.

## MVP Stage Overlay

Updated on 2026-06-22 from `GNE-172` MVP factory route consensus, `GNE-168` MVP1-MVP6 route mapping, `GNE-190` MVP2 consensus, and the `GNE-72` PAYMENT boundary cleanup.

The project now keeps two planning views at the same time:

- Stage view: `MVP1` through `MVP6` explain what each delivery stage proves.
- Module view: parent issues keep engineering ownership, specs, and implementation boundaries.

```text
MVP1 基础底座
├── GNE-11 MVP1 FOUNDATION-00
├── GNE-70 MVP1 APP-00
├── GNE-132 MVP1 DATA-00
├── GNE-133 MVP1 API-00
├── GNE-5 MVP1 AUTH-00
└── GNE-74 MVP1 DEPLOY-00

MVP2 扩展底座
├── GNE-190 MVP2-KNOW-01
├── GNE-167 MVP2 INTEGRATIONS-00
├── GNE-71 MVP2 BILLING-00
├── GNE-72 MVP2 PAYMENT-00
├── GNE-148 MVP2 AI-00
└── GNE-73 MVP1-MVP3 ANALYTICS-00

Release-final bug bucket: `GNE-209` was closed as Done after PR #32 and PR
#33 were merged. It should not keep the MVP2 milestone visually open. New Auth
confirmation and duplicate-signup follow-ups after PR #33 are handled in a
separate PR #34 branch rather than reopening `GNE-209`.

MVP3 Reference Product：双底座架构与 Package 消费验证
├── GNE-228 MVP3-01 PLAN [DOC/ARCH] 范围、双底座架构与失败标准
├── GNE-229 MVP3-02 PLATFORM [ARCH] 基座 Package 化与产品消费
├── GNE-230 MVP3-03 DELIVERY [DEPLOY] Package 化后的交付门禁与部署回归
├── GNE-231 MVP3-04 PRODUCT [APP/DATA] 主人侧 Reference Product 最小业务闭环
├── GNE-232 MVP3-05 ACCESS [SECURITY] 私密分享、匿名访问与提交边界
├── GNE-233 MVP3-06 CAPABILITY [AI/BILLING/OUTBOX/AUDIT] 平台能力接入真实业务
├── GNE-234 MVP3-07 VERIFY [QA] 交叉验证、升级演练与 v0.3.0 结论
└── GNE-298 MVP3-08 TEMPLATE [ARCH/PRODUCT] 纯净基础母版候选

Future / Backlog 横向能力
└── GNE-75 FUTURE GROWTH-00 [GROWTH] 通用增长营销与反馈闭环

MVP4 国内外双模式底座
└── GNE-193 MVP4 INTEGRATIONS-00

MVP5 真实海外垂直产品验证
└── GNE-201 MVP5 PAYMENT-00
```

`GNE-168` records the detailed MVP1-MVP6 mapping. `GNE-190` is an MVP2 consensus document, not an implementation parent. `GNE-167` is MVP2-only integrations: provider matrix, env naming, mock/no-op/sandbox strategy, and interface boundaries. `GNE-193` owns MVP4 overseas / China adapter, env template, mock, and launch-checklist planning. `GNE-201` owns future production payment readiness for real vertical products.

MVP3 execution now starts with `GNE-228 / MVP3-01 PLAN`, follows
`GNE-229` through `GNE-234`, then enters `GNE-298` only after VERIFY is Done.
The stage validates a Reference Product and a
package-consumed platform foundation, not the old Product Validation Kit. MVP3
uses the 4-package naming convention `@xwlc/core`, `@xwlc/ui`,
`@xwlc/platform`, and `@xwlc/db`; do not mix in the previous 5-package naming
unless a later v0.3.x decision explicitly splits the packages. Product-specific
cat-care objects stay in the Reference Product repo and must not enter the
platform packages. Live payment still belongs to MVP5 or later.

GitHub tag `v0.2.0` is the MVP2 sealed baseline. MVP3 implementation branches
should start from latest `main` at or after `v0.2.0`, not from old PR branches.
Current cloud Supabase is reference/staging/test for MVP3 validation; Production
Supabase is not enabled during MVP3 and should be recorded as `not_run / not
enabled in MVP3` when a template asks for Production evidence.

`GNE-228` PLAN records the current stage decisions before implementation starts:
MVP3 keeps the Linear + repo evidence-sync rule from MVP1/MVP2; it continues on
`main` with short task branches instead of a long-lived `mvp3` branch; it stays
single-repo/monorepo for MVP3 while enforcing package boundaries; it uses the
current cloud Supabase project only as reference/staging/test; it keeps
Supabase + Vercel as the mainline; it treats Cloudflare/Hono as future adapter
readiness only; and it keeps AI/Billing on mock/no-op/sandbox/test paths.

`GNE-228` also defines the MVP3 failure standards. MVP3 should be considered
off-track if product-specific cat-care objects enter platform packages, if work
starts from old pre-`v0.2.0` branches, if child issues are executed out of the
parent sequence without an explicit decision, if production Supabase/live
payment/real AI become MVP3 blockers, if private-link raw tokens or private
content appear in logs, docs, Linear, PostHog, or reviewer evidence, or if the
final Reviewer path cannot connect page flow, Supabase data/RLS, Vercel/env,
PostHog, GitHub CI, package version, and schema version evidence.

MVP3 parent dependency chain is linear by design: `GNE-228` blocks `GNE-229`,
`GNE-229` blocks `GNE-230`, `GNE-230` blocks `GNE-231`, `GNE-231` blocks
`GNE-232`, `GNE-232` blocks `GNE-233`, `GNE-233` blocks `GNE-234`, and
`GNE-234` blocks `GNE-298`. This is
the 小团队 WIP rule for MVP3: one parent issue should carry the main
implementation at a time; the next parent can be reviewed ahead, but should not
start a separate implementation track unless the team deliberately accepts that
tradeoff.

MVP3 child issues were created on 2026-06-26 after the parent-issue charter was
approved. These child issues are attached to their parent issues, carry no
Linear labels, and should remain `No milestone` so the milestone view stays
focused on the eight parent issues. Parent issues should now act as navigation,
boundary, input/output, and reviewer-acceptance charters; implementation
details, SQL, commands, screenshots, runbook records, and final evidence belong
inside child issues or specs/context documents.

On 2026-06-26, the MVP3 milestone and execution issues were strengthened for
newcomer and reviewer readability. The milestone now contains Mermaid diagrams
for dual-foundation architecture, the business loop, data flow, and reviewer
verification flow. The eight parent issues now include purpose, rationale,
boundaries, code-architecture role, reusable-platform value, product value,
reviewer actions, and verification method. Key child issues add concrete
templates for glossary/diagrams, package boundaries, delivery evidence, product
data model, share-token lifecycle, capability mapping, and the 30-minute
Reviewer Runbook. Do not duplicate the full diagrams here; keep Linear as the
primary readable execution surface and sync only durable decisions into
`context/*` or `specs/*`.

The follow-up execution-quality review was accepted with scope control. Linear
now adds the MVP3 final 5 questions, a code-directory mapping table, and a
minimum construction template for child issues. High-risk child issues were
expanded: `GNE-251` has the Reference Product ERD/minimum fields/RLS ownership,
`GNE-259` has the owner/anonymous permission matrix, `GNE-252`, `GNE-253`,
`GNE-257`, and `GNE-258` have page-level Done criteria, and `GNE-273` /
`GNE-274` have final conclusion and product-expansion templates. Do not
mechanically expand all 39 child issues before execution; instead, bring each
child issue up to the minimum construction template when its parent becomes
active. Create a standalone MVP3 evidence document only after real verification
evidence exists.

The PLAN pure-document child issues were intentionally collapsed back into
`GNE-228` after the milestone and parent issue absorbed their content. `GNE-236`,
`GNE-237`, and `GNE-239` were manually deleted, and `GNE-238` is no longer needed
after its ADR checklist was merged into `GNE-228`. Do not recreate PLAN child
issues unless new executable work appears.

The second execution-risk review was accepted where it improved execution
clarity, not where it duplicated already-added diagrams. `GNE-247` now spells
out migration/schema-version flow, product-vs-platform migration ownership, RLS
SQL coverage, and no-dashboard-only schema edits. `GNE-243` now carries
machine-checkable package and runtime boundary checks. `GNE-263`, `GNE-264`,
`GNE-265`, and `GNE-267` now describe Outbox, AI draft, Billing/Credit, and
failure/retry/idempotency behavior in enough detail for implementation and
review. `GNE-251` now includes the unified Reference Product state model. The
parent chain remains linear: `GNE-228` blocks `GNE-229`, `GNE-229` blocks
`GNE-230`, `GNE-230` blocks `GNE-231`, `GNE-231` blocks `GNE-232`, `GNE-232`
blocks `GNE-233`, `GNE-233` blocks `GNE-234`, and the later TEMPLATE parent
adds `GNE-234` blocks `GNE-298`. No labels were added.

Several overlap-prone child issues have explicit boundaries: `GNE-248` defines
the minimum app/package/db version-location method while `GNE-272` aggregates
final evidence; `GNE-249` was canceled and merged into `GNE-230` so delivery
failure handling stays a parent-level gate instead of a standalone operations
track; `GNE-255` covers Product page analytics while `GNE-266` covers
cross-capability PostHog correlation; `GNE-260` implements ACCESS security
rules/audit while `GNE-270` independently reruns final security negative
verification.

```text
GNE-228 PLAN
└── No active child issues; PLAN scope, diagrams, ADR, and WIP rules live in the parent issue and milestone.

GNE-229 PLATFORM
├── GNE-240 PLATFORM-01 Package 边界与依赖方向 (Done, PR #37)
├── GNE-241 PLATFORM-02 core/ui/platform/db 最小公开入口 (Done, PR #38)
├── GNE-242 PLATFORM-03 apps/web 与 Reference Product 消费 Package (Done, PR #40)
├── GNE-243 PLATFORM-04 package build/typecheck/boundary 检查 (Done, PR #41)
└── GNE-244 PLATFORM-05 Package patch 升级演练 (Done, PR #42)

GNE-230 DELIVERY
├── GNE-245 DELIVERY-01 单仓 CI 覆盖与 package 交付门禁 (Done)
├── GNE-246 DELIVERY-02 Reference Product 环境差异确认 (Done)
├── GNE-247 DELIVERY-03 Reference Product migration 规范延续 (Done)
└── GNE-248 DELIVERY-04 app/package/db 最小版本定位 (Done)

GNE-249 DELIVERY-05 已取消独立执行并并入 GNE-230：交付失败处理原则
属于父任务门禁，不再作为单独子任务推进。

GNE-230 implementation note: DELIVERY is active and is being kept to the new
package-consumption delivery risks only. GNE-245 through GNE-248 are Done and
covered by `specs/deploy/acceptance.md`, `specs/deploy/test-plan.md`,
`context/environment-matrix.md`, and `context/deployment-status.md`: the repo
stays single-monorepo, CI runs install/lint/typecheck/test/build on PRs and
`main`, root `pnpm test` includes package-boundary checks, Reference Product
introduces no new environment variables for the current package-consumption
entry, no Reference Product migration is needed yet, and the GNE-244 rehearsal
provides minimum app/package/db version facts through PR #42, merge commit
`2bd2572`, `@xwlc/*` `0.1.1`, no DB migration, CI/build evidence, Vercel
Production deployment success, and local `/catcare` smoke `200 OK`.
GNE-250 was moved under GNE-234 as VERIFY-06. PRODUCT, ACCESS, and CAPABILITY
have now created the deployable business path, so its deployment smoke must run
after VERIFY-05 and before the final v0.3.0 decision.

GNE-243 implementation note: package/import/runtime/privacy boundary checks now
run through `scripts/verify-package-boundaries.mjs`, exposed as
`pnpm test:package-boundaries`, and included in the root `pnpm test` chain used
by GitHub PR CI. Local verification passed with `pnpm test:package-boundaries`,
`pnpm typecheck`, `pnpm test`, `pnpm build`, and `git diff --check`. A temporary
negative sample using `@xwlc/platform/src/index` was verified to fail the
boundary check, then removed; rerunning `pnpm test:package-boundaries` passed.
The branch `codex/gne-243-package-boundary-checks` was merged as PR #41, and
`GNE-243` is Done in Linear.

GNE-244 implementation note: the package patch rehearsal bumps `@xwlc/core`,
`@xwlc/ui`, `@xwlc/platform`, and `@xwlc/db` from `0.1.0` to `0.1.1`, adds the
public `@xwlc/db` `formatSchemaVersion` helper, and keeps the Reference Product
minimum entry consuming package public exports. No DB migration, CF/Hono
adapter, product business object, or deployment setup was added. Local
verification passed with `pnpm test:package-boundaries`, `pnpm typecheck`,
`pnpm test`, `pnpm lint`, `pnpm build`, `HEAD /catcare` returning
`200 OK`, and `git diff --check`. PR #42 was merged, Vercel Production
deployment completed successfully, the reviewer confirmed the page opened, and
`GNE-244` plus parent `GNE-229` are Done in Linear.

GNE-231 PRODUCT
├── GNE-278 PRODUCT-00 CatCare 高保真产品旅程、页面地图与付费触发点
├── GNE-280 PRODUCT-01 [UI/SYSTEM] V6 原型转标准 SaaS UI
├── GNE-251 PRODUCT-02 [DATA] 猫咪档案、喂养习惯、用品、事件、照护计划、任务、提交数据模型
├── GNE-252 PRODUCT-03 主人侧创建/编辑/发布流程
├── GNE-288 PRODUCT-04 [ARCH] CatCare 服务层拆分与局部更新边界收敛
├── GNE-253 PRODUCT-05 [APP/UX] 主人侧计划确认、结果查看和状态变化
├── GNE-254 PRODUCT-06 Supabase RLS 验收 SQL 与 seed 数据
├── GNE-255 PRODUCT-07 基础事件和页面级验收
└── GNE-290 PRODUCT Polish: 按 V6 原型 06-11 顺序恢复 CatCare 产品链路质感

GNE-278 implementation note: PRODUCT execution now runs through PRODUCT-00 as
the page-map and prototype gate before more GNE-251/GNE-252 implementation is
expanded. The accepted visual source is the regenerated 13-screen split
prototype set under
`specs/reference-product/prototypes/v6-regenerated-normalized/`, with the
binding product spec at `specs/reference-product/gne-278-product-flow.md`.
Discarded prototype drafts and older boards were removed. The product separates
cat identity from reusable daily care routines, then generates a temporary care
checklist from routine + scenario + dates. Paid state must appear in
value-consuming product surfaces such as dashboard, routine optimization,
generated checklist, private share, owner results, and billing; it must not
appear on the anonymous sitter page. The product model also includes lightweight
daily events and food/treat/care items as AI generation inputs, but they are not
first-run blockers. The short activation path remains: cat profile + recurring
routine + scenario -> AI/mock generated checklist -> share -> sitter check-in ->
owner results/paywall. MVP3 CatCare pricing is USD-first.
GNE-278 is Done in Linear. GNE-251 is Done after PR #44 and owns the PRODUCT02 schema
expansion for `cats`, `care_routines`, `care_routine_items`, `care_items`,
`care_events`, `care_plans`, `care_tasks`, and `care_submissions`. GNE-251
has remote Supabase evidence: the linked test project has all 8 tables, RLS
enabled, 4 owner policies per table, `authenticated` / `service_role` grants,
REST `200 ok` for each table after schema reload, and migration history version
`20260629075823` recorded. Local `supabase db reset` remains blocked by a
Colima/VZ disk lock; this is an environment blocker, not a project-code failure.
GNE-251 data verification is also gated by a real CatCare page shell:
Landing, login/register, authenticated default workspace, and
account/billing/usage entries must be product-context pages, not generic
starter/demo UI. Full high-fidelity owner workflow remains GNE-252/GNE-253.
Current PRODUCT01 UI gate status: Landing primary CTA now enters CatCare
signup/workspace, Landing secondary CTA stays inside the CatCare flow,
`/login` is the CatCare shell defaulting to `/catcare`, and
`/account`, `/account/billing`, `/account/usage`, payment shell, account menu,
and footer product links no longer expose `/dashboard` or `/demo` as part of
the CatCare product flow. The foundation demo routes remain reachable directly
at `/demo`, `/demo/login`, and `/dashboard`.
Historical scope note: an earlier branch state mixed `GNE-251 PRODUCT-02 DATA`
with minimal data-verification UI before `GNE-280 PRODUCT-01 UI/SYSTEM` was
inserted. Current GNE-280 work must be described as UI/SYSTEM only and must not
claim completion of GNE-251 DATA or GNE-252 APP. Reference Product actions,
forms, page creation, and publish behavior remain APP-shaped and belong to
later PRODUCT issues unless explicitly re-scoped.
New PM note: accumulated daily events can later power a paid text/video recap
for social sharing (domestic: Moments/Xiaohongshu/Douyin; overseas: X/YouTube).
This is a valid future CAPABILITY/GROWTH monetization candidate, not MVP3 core.

GNE-288 PRODUCT-04 planning note: this dedicated MVP3 PRODUCT architecture
follow-up was created after GNE-252 owner-flow acceptance. It is a child of
`GNE-231`, blocked by `GNE-252`, and blocks `GNE-253`, `GNE-232`, and
`GNE-233`. Scope: split `apps/web/lib/catcare/product-service.ts` by cats,
routines, items, events, plans, and catalog/cache; preserve current behavior;
keep CatCare business types, dictionaries, icons, and product semantics out of
`packages/*`; keep `/demo`, `/demo/login`, `/dashboard`, and `/demo/account*`
unaffected.

GNE-288 implementation note: `apps/web/lib/catcare/product-service.ts` is now a
compatibility barrel, with implementation split under
`apps/web/lib/catcare/product-service/` into `workspace.ts`, `cats.ts`,
`routines.ts`, `items.ts`, `events.ts`, and `plans.ts`. Shared service and DB
row types live in `types.ts`; select strings, cache TTLs, and default routine
definitions live in `constants.ts`; internal shared cache loaders, normalizers,
mappers, analytics helpers, and cross-domain utilities remain in `core.ts`.
Existing page/server-action imports continue through the barrel, so GNE-252
owner-flow behavior is preserved while future PRODUCT work has clear domain
entry points. No CatCare business object, product dictionary, icon, or product
service implementation was moved into `packages/*`. Local verification passed
with `pnpm typecheck`, `pnpm lint`, `pnpm test:package-boundaries`,
`pnpm test:release-boundaries`, `pnpm build`, and `git diff --check`.

GNE-288 corrective lifecycle note (2026-07-13): the issue was reopened after a
production cat-delete refresh defect exposed per-instance stale owner caches and
hard-delete history loss. The accepted replacement is universal logical delete:
active pages hide archived cats and their mutable aggregate children; plans,
tasks, submissions, recap data, and immutable participant name snapshots remain;
historical pages append `（已删除）`; draft/published plans and active share links
block archival; direct authenticated hard delete is revoked; and successful
archival writes a redacted atomic audit event. Remote migration and merge remain
gated after local verification.

GNE-253 PRODUCT-05 scope update: this issue is now the owner-side
APP/UX continuation after GNE-252 and GNE-288. It does not reopen GNE-252 and
does not introduce ACCESS. Phase 1 must first pull the GNE-252 owner plan
confirmation and execution-calendar UX to an 85+ baseline: summarize plans by
date range, cats, visit count, visit batches, key handoff notes, compact task
editing, and date/time/multi-time control consistency. Phase 2 then expands
owner-visible results and state changes: pending/published/closed/completed
states, owner result hierarchy, owner-only mock submission/status display, and
history cleanup. `/s/[token]`, anonymous sitter submit/view, share token
tables, live AI, live payment, real entitlement deduction, and CatCare business
objects in `packages/*` remain out of scope.

GNE-253 completion note: the owner-side UX/results lane is complete after PR
#49 merged on 2026-07-06 at merge commit `1190f64`, GitHub CI passed, and
Vercel Production deployment `5329868439` completed with `success`. Plan
confirmation and execution-calendar UX were compacted earlier in the issue, and
owner result pages now use real `care_submissions` rows when available. Plans
with no real sitter submissions show pending/closed empty states instead of fake
feedback. Local evidence includes `pnpm typecheck`, `pnpm lint`,
`pnpm test:package-boundaries`, `pnpm test:release-boundaries`, `pnpm test`,
`pnpm build`, `git diff --check`, and browser checks on `/catcare/results` plus
published and closed owner result detail pages. ACCESS remains the next-stage
owner/anonymous share-link and sitter-submission boundary.

GNE-280 is the active PRODUCT-01 UI/SYSTEM task. The first accepted boundary
decision is to keep the MVP1/MVP2 foundation demo, but isolate it as a demo
surface instead of mixing it with CatCare. Demo-owned routes are `/demo`,
`/demo/login`, `/dashboard`, and `/demo/account*`; CatCare-owned routes remain
`/`, `/login`, `/catcare*`, and `/account*` for now. Demo navigation
must not link into `/catcare` or CatCare account pages, and CatCare
navigation must not link into `/dashboard`. This keeps old foundation
verification available while letting GNE-280 turn CatCare into a coherent SaaS
product surface.
Binding UI reference for GNE-280 is the regenerated PRODUCT-00 split-screen set
under `specs/reference-product/prototypes/v6-regenerated-normalized/` plus
`specs/reference-product/gne-278-product-flow.md`. Older visual inputs and
discarded prototype drafts must not override those references.
The canonical product route is now `/catcare`; `/reference-product*` remains
only as a legacy MVP3 engineering compatibility shim that redirects to the
matching `/catcare*` route. CatCare app code has moved to `apps/web/app/catcare`
and product services to `apps/web/lib/catcare`; Reference Product remains the
MVP3 validation concept, not the customer-facing route or app directory name.
`/account/billing` now renders CatCare billing/entitlement UI, while
`/demo/account/billing` keeps the foundation demo billing surface.
CatCare account menus and workspace navigation default away from `/dashboard`;
only the explicit demo surface exposes Demo Dashboard. The product brand lives in
`apps/web/components/catcare-brand.tsx`, and the current Landing/Login visual
asset lives at `apps/web/public/catcare/hero-handoff.png`.
Latest PM/UI critique accepted into GNE-280: GNE-280 should make Landing,
Login, `/catcare`, `/account/billing`, and `/account/usage` read as a real
CatCare product, while keeping full CRUD, real AI generation, anonymous
share-token security, and Order/Entitlement return for later issues. `/catcare`
now surfaces the product loop from cat/routine context to AI-generated temporary
checklist, private sitter handoff, owner review, and paid recap. Section
skeletons now distinguish routines, one-off events, supplies, plans, and paid
result triggers.
Latest 2026-07-01 GNE-280 UI pass keeps the issue open. Landing and Login have
been rebuilt toward the V6 split-screen references with CatCare product-layer
components and assets under `apps/web/components/catcare-ui.tsx` and
`apps/web/public/catcare/`. `/account/billing` and `/account/usage` now use the
CatCare product shell instead of the generic starter AppShell. Local screenshots:
`/private/tmp/catcare-landing-chrome-r7.png` and
`/private/tmp/catcare-login-chrome-r7.png`. Signed-out `/catcare`,
`/account/billing`, and `/account/usage` correctly redirect to login; their
visual acceptance still needs an authenticated browser session. Current visual
self-assessment remains below the 90% closing bar, so GNE-280 must not be
closed yet.
Latest 2026-07-02 GNE-280 implementation lesson: normalized prototypes are the
binding visual source, but final page assets must be product-normalized before
component integration. Avoid wiring whole-page crops when they contain text,
card borders, selected fills, or clipped cats. Pricing card cats now use
same-size product assets under `apps/web/public/catcare/`; icon assets remain
CatCare product-layer assets under `apps/web/public/catcare/icons/` and should
come from prototype/source crops plus tracing/repair before any hand-drawn
fallback. The accepted icon weight is the unthinned prototype PNG -> `potrace`
fill SVG output; the thinner morphology variant was tested and rejected as the
default. Unused PRODUCT-02 form/action files should not remain in the GNE-280
UI/SYSTEM surface.

GNE-231 implementation note: PRODUCT is active on current `main` per repo-owner
instruction, despite the normal task-branch rule. The corrected product boundary
is: GNE-231 must provide a real CatCare product entry, not a generic starter page
with explanatory cards. The page-side product surface includes the CatCare
homepage, CatCare login/signup context, owner workspace, owner data model, forms,
publish state, result/submission slots, and visible account / billing-payment /
AI Credit capability entries. The existing foundation demo remains available
through `/demo`, `/demo/login`, and `/dashboard`; it is not the Reference
Product first screen. `/login` is the CatCare product login shell, while
`/demo/login` preserves the old demo shell and reuses the same Auth service.
CatCare's protected workspace must not show `/dashboard` in its primary nav or
account menu; `/dashboard` remains reachable only as a foundation demo route.
GNE-233 owns the deep product-specific wiring for
entitlements, payment actions, AI Credit consumption, AI draft behavior, Audit,
Outbox, and PostHog correlation. The current implementation keeps cat-care
objects in `apps/web`, adds product tables through a Supabase migration, and
does not create a Cloudflare/Hono adapter or move product objects into
`packages/*`. `share_tokens` is deferred to GNE-232 ACCESS so token scope,
expiry, revocation, replay behavior, anonymous visibility, and token-hash safety
are designed together instead of pre-allocating an unused token table in PRODUCT.
Local 2026-06-29 verification passed with `pnpm test:package-boundaries`,
`pnpm typecheck`, `pnpm lint`, `pnpm build`, `git diff --check`, and browser
smoke for `/`, `/login`, and `/catcare`: CatCare product-first copy,
retained foundation demo entry, signup, cat creation, care-plan creation,
publish state, account/billing/usage capability links, and 390px mobile
no-horizontal-overflow. Remote 2026-06-30 verification applied the 8-table
PRODUCT02 migration to the linked Supabase test project through linked SQL
because direct Postgres CLI sessions failed with TLS EOF; SQL/RLS/grant checks
and REST Data API smoke passed.

GNE-232 ACCESS
├── GNE-256 ACCESS-01 share token scope、有效期、撤销和重放规则
├── GNE-279 ACCESS-02 owner 生成、复制、撤销分享入口
├── GNE-257 ACCESS-03 匿名查看页面和最小可见数据
├── GNE-258 ACCESS-04 匿名提交和字段白名单
├── GNE-259 ACCESS-05 owner-only 与匿名边界 RLS 验收
└── GNE-260 ACCESS-06 安全负向测试和审计事件

GNE-257 implementation note: anonymous `/s/[token]` now resolves real
`share_tokens` through the CatCare product-service boundary, loads the
published care plan and enabled tasks with the service role, and returns a
minimum read-only sitter DTO. The page renders valid, expired, revoked,
invalid, and unavailable states without owner navigation, billing/payment/AI
controls, submission UI, owner email, internal ids, raw token, token hash, or
debug data. GNE-257 also adds the global Next `viewport` export because mobile
QA showed the anonymous page otherwise rendered as a scaled desktop page.
Verification used the linked Supabase test env with temporary token rows that
were deleted after checking valid/expired/revoked/invalid states, plus mobile
browser QA at 390px valid and 375px invalid states. GNE-258 owns anonymous
submit; GNE-259 owns owner/anonymous RLS acceptance; GNE-260 owns security
negative and audit checks.

GNE-258 boundary correction: this ACCESS child should be accepted only as the
anonymous submit technical foundation when verified: share-token based submit,
real `care_submissions`, field whitelist, date/visit validation,
duplicate/update handling, and owner result visibility. It must not claim final
PRODUCT-quality completion of the `/s/[token]` sitter experience. The
prototype-chain polish for screens 06 through 11 has been reopened as
`GNE-290` under `GNE-231`, and must run from `06-food-care-items.png` through
`11-sitter-checklist.png` in order. GNE-258 non-goals remain: no live
AI/payment/entitlement, no anonymous photo upload or Storage/RLS image flow, no
anonymous paid-state display, and no CatCare business objects in `packages/*`.

GNE-258 regeneration policy, 2026-07-08: regenerating a private share link is
an entrance rotation, not a reset of care results. Existing anonymous
`care_submissions` stay owner-visible, revoked old links cannot view or submit,
and the new active link must recognize already submitted plan/date/visit/task
slots so the sitter cannot duplicate the same care result after regeneration.
The service now accepts legacy token-scoped submission refs but writes new
anonymous idempotency keys at plan scope.

GNE-259 access-boundary note, 2026-07-08: ACCESS-05 is an evidence issue, not a
new user-facing feature. The repository now has
`supabase/tests/catcare_access_boundary.sql` as a linked-test rollback SQL
matrix for Owner A/B isolation across CatCare owner rows, submissions, and
share tokens, plus anonymous direct-role rejection for private tables and
token/submission writes. The matching specs record the app-layer portability
boundary: owner services carry explicit `owner_id` filters, while anonymous
services resolve a token into `ownerId`, `resourceId`, task, service-date, and
visit-time scope instead of treating a token as a logged-in owner.

GNE-260 security-negative note, 2026-07-08: ACCESS-06 is a negative matrix and
audit-requirement issue, not CAP-02 audit implementation. The repository now
uses `specs/reference-product/access-security-negative-matrix.md` as the
Reviewer/VERIFY handoff for cross-owner abuse, expired/revoked/tampered token
paths, repeat link generation, duplicate submit, forwarded-link scope, direct
anonymous DB/API attempts, and raw-token leakage checks. The same document marks
reusable ACCESS security as `common_pattern_not_extracted` or
`common_contract_verified`, keeps CatCare business fields as `catcare_specific`,
and records CF/Hono risks where audit persistence or full `correlation_id`
propagation is not yet implemented.

GNE-290 planning note: this PRODUCT polish issue is the corrective pass for
the accumulated drift from the V6 prototype chain across Food & Care Items,
Events, Scenario & AI Inputs, AI Generate & Review, Private Share, and Sitter
Checklist. It must preserve the real ACCESS/backend details already added for
share tokens and submissions, while restoring page structure, visual hierarchy,
icon/button quality, mobile operation flow, and three-party review evidence
(architecture boundary, UI/icon quality, and product interaction).

GNE-290 progress note 2026-07-07: current local work has restored the visible
direction for 06-11 without claiming Done before the PR/merge gate. 06/07/08/
09/10/11 now have prototype markers or framing in the app, anonymous task flow
has better family-vs-cat scope clarity and mobile step behavior, and
verification passed typecheck, lint, test, build, package-boundary,
release-boundary, and diff checks. Final visual QA captured authenticated owner
screenshots for 06-10 and active-token mobile screenshots for 11 at
`/private/tmp/gne290-final-*`; all captured pages stayed within viewport width.

GNE-290 product-quality rework note 2026-07-07: later PM/UI feedback supersedes
the earlier above-threshold review score. Raw prototype PNGs and bare
engineering-like line icons are no longer acceptable as product-object Done
evidence. The current local pass uses product-local colored semantic glyph
badges for item categories, routine/task cards, event timeline rows, plan task
lines, and anonymous sitter task cards. It also moves plan history out of the AI
input summary column, makes the published plan page a care-plan overview, and
improves anonymous task cards around category visuals and family/cat scope
chips. Post-rework local QA has authenticated owner screenshots for prototype
screens 06-10 and valid active-token mobile screenshots for 11, with no
horizontal overflow at `1440px` desktop and `390px` mobile. A 3003
style-looking failure was traced to stale/corrupted Next dev `.next` output, not
a deliberate UI regression; after clearing `.next`, sandbox-external curl
verified `/login 200 OK` and CSS `200 OK`. Final cleanup deleted the isolated
online QA owner/token rows (`share_tokens 1`, `care_tasks 7`, `care_plans 1`,
`care_events 3`, `cat_item_assignments 12`, `owner_item_library 6`, `cats 2`,
`user_profiles 1`, `auth_user 1`) and verified inspected owner-scoped table
counts as `0` before PR/merge closure.

GNE-233 CAPABILITY
├── GNE-261 CAP-01 业务动作到能力映射表
├── GNE-262 CAP-02 Audit 接入发布、分享、提交、撤销动作
├── GNE-263 CAP-03 Outbox 接入通知和异步任务
├── GNE-264 CAP-04 AI 生成照护摘要或提醒文案
├── GNE-265 CAP-05 Billing/Credit 用量权益
├── GNE-266 CAP-06 PostHog 行为与能力事件串联
└── GNE-267 CAP-07 失败、重试、幂等与降级验证

GNE-261 CAPABILITY action-map note, 2026-07-08:
`specs/reference-product/capability-action-map.md` is the CAP-01 handoff for
GNE-262 through GNE-267. It maps owner publish/share/revoke, anonymous
view/submit, owner result review, AI recap, entitlement/checkout, Outbox,
PostHog, and reliability actions to product facts, capability adapters,
foundation decisions, and Cloudflare/Hono risks. The common-foundation uplift is
the standardized actor/owner/token/resource/correlation/idempotency handoff and
explicit use of `@xwlc/platform`, `@xwlc/db`, and `@xwlc/core` contracts.
Share-token and anonymous-submit behavior stay `common_pattern_not_extracted`
until a second product validates a generic capability.

GNE-262 CAPABILITY audit note, 2026-07-08:
CAP-02 adds `audit_events`, a product-local CatCare Audit facade, business
event wiring for publish/share/revoke/anonymous-view/anonymous-reject/anonymous
submit, and an owner-visible "分享与安全记录" panel on plan detail. The common
foundation improvement is the reusable audit event envelope and redaction rules
around actor, owner/resource/token scope, `correlation_id`, and
`idempotency_key`; storage and UI remain product-local. Outbox, AI,
Billing/Credit, PostHog, and reliability retry semantics remain owned by
GNE-263 through GNE-267.

GNE-263 CAPABILITY outbox note, 2026-07-08:
CAP-03 adds `outbox_events`, a product-local CatCare Outbox facade, and pending
owner-notification records after anonymous submission create/update. It first
splits anonymous submission handling out of `share-tokens.ts`, reducing the
share-token service from 1120 lines to the token/view boundary while keeping a
generic share-token package deferred until a second product validates it. The
common-foundation improvement is the outbox envelope around aggregate,
status/attempt, `correlation_id`, `idempotency_key`, and redacted payload. The
idempotency key is unique and Outbox writes upsert, so a repeated anonymous
task update refreshes one pending notification instead of queuing duplicates;
real worker delivery and PostHog correlation remain later CAP work.

GNE-264 CAPABILITY AI recap note, 2026-07-08:
CAP-04 adds an owner-side "生成复盘草稿" entry on the CatCare plan result page.
The action reads owner-scoped plan results through the existing product service,
builds a redacted structured prompt from `PlanResultSummary`, and calls the
core AI facade so provider mode, entitlement/credit gate, usage recording, and
PostHog-safe metadata stay behind the shared capability contract. The prompt
uses counts, overdue task labels, and attention task labels only; raw
submission notes, private handoff text, raw share tokens, token hashes, owner
email, and internal debug fields are not included. The UI shows mock/no-op/
sandbox mode, generated draft text, failed/degraded states, and a usable path
to usage/subscription pages when entitlement or quota blocks generation. Usage
metadata is allowlisted to `correlation_id`, `resource_id`, `resource_type`, and
`request_source` so ledger evidence can trace owner/plan/action without storing
private prompt content. Live AI provider quality, real payment, and generic
share-token extraction remain owned by later CAP work.

GNE-264/GNE-265 in-progress note, 2026-07-10:
Current active CAP work remains `GNE-264` and `GNE-265`; do not start
`GNE-266` until AI generation/recap and Billing/paywall return have authenticated
smoke evidence. AI plan generation and AI recap now revalidate CatCare plus
`/account`, `/account/billing`, and `/account/usage` after successful usage
commit so the product shell and Billing review pages can refresh allowance
state without relying on a manual full-page navigation.

GNE-264/GNE-265 implementation verification note, 2026-07-10:
GNE-264 now gives plan generation and result recap the same server-side AI
entitlement/credit gate. The result page reads the entitlement snapshot before
rendering: zero remaining uses disables generation/regeneration and exposes the
CatCare paywall while existing recap content remains viewable. GNE-265 now keeps
safe internal returns in one helper and splits CatCare Billing presentation into
the overview composer, plan-comparison section, and records section; the main
view decreased from 681 to 343 lines without creating a generic Billing UI
package. Fresh evidence passed 20 web tests, web typecheck, package/release
boundary checks, diff check, and production build. The linked online test
Supabase returned readable Billing tables; sampled AI entitlement/usage values
were `credit` and 10000-block aligned. Authenticated desktop 1440x800 and mobile
390x844 browser smoke now covers the owner result/recap route and Billing page
without horizontal overflow. This closes GNE-264 page evidence. Creem Test Mode
payment then completed and returned to the originating CatCare result route.
The new paid test order has one active 100000-credit entitlement and one matching
grant ledger; replaying the successful return kept both counts at one. This
closes the GNE-265 payment-return and idempotency evidence without treating test
payment as live charging.

GNE-265 CAPABILITY billing return-flow note, 2026-07-08:
CAP-04 connects the CatCare AI recap blocked state to the existing Billing/
Payment sandbox path. When the server-side AI/Billing gate blocks generation,
the result page can send the owner to `/account/usage` with a CatCare
`return_to` context or directly into the sandbox credit-pack checkout. The
usage page shows a CatCare-specific Paywall panel only for safe `/catcare`
return paths, and the payment service now allowlists `/account` and `/catcare`
return URLs with exact path-prefix checks so success/cancel/failure can return
to the original plan result page without allowing external redirects. This
strengthens the common payment return capability while keeping order,
entitlement, credit, and usage facts inside the existing server-side Billing/
Payment services. Live payment, invoices, refunds, proration, and
client-derived entitlement remain non-goals.

GNE-265 structure guardrail, 2026-07-09:
CAP-04 must not keep growing `apps/web/app/account/catcare-billing-overview.tsx`
as a single large product page file. If the page still owns current entitlement,
AI usage, credit-pack purchase, plan comparison, order records, and usage
records together, split the CatCare billing page into minimal local sections
before closing the issue. This is a CatCare product-view boundary, not a shared
Billing UI package.

GNE-266 CAPABILITY foundation-hardening note, 2026-07-11:
The exact-four capability context and generic anonymous share-credential state
machine now use the `@xwlc/platform` public entry. Runtime Node crypto, CatCare
share rows, anonymous-view DTOs, and product copy stay app-local. CatCare owns
its event schema and property allowlist; the common Analytics transport owns
only the provider adapter, bounded primitive filtering, envelope protection,
value-level secret rejection, and route-name-independent URL redaction.
PostHog single-event capture uses `/i/v0/e/`. A tested fan-out helper supplies
one validated context instance to capability consumers, and unsafe client
generation identifiers are replaced with a server UUID. This is the durable
Travel-product reuse boundary; it does not introduce Travel DTOs or UI.

GNE-267 structure guardrail, 2026-07-09:
CAP-07 must use its failure/retry/idempotency pass to keep `apps/web/lib/services/billing.ts`
from becoming the sink for every Billing/Credit concern. If ledger write,
usage commit, duplicate commit lookup, entitlement snapshot, plan cache, and
activity query still live together, first extract the smallest Billing ledger /
usage commit helper or same-folder module needed to test duplicate charge and
failed ledger paths. Do not push AI, Audit, Outbox, or analytics correlation
logic back into `billing.ts`.

GNE-234 VERIFY
├── GNE-268 VERIFY-01 Reviewer 账号、测试数据、URL、版本
├── GNE-269 VERIFY-02 30 分钟 Reviewer Runbook
├── GNE-270 VERIFY-03 安全负向验证
├── GNE-271 VERIFY-04 Package patch 与 DB migration 验证
├── GNE-272 VERIFY-05 PostHog、Vercel、Supabase、GitHub CI 证据汇总
├── GNE-250 VERIFY-06 部署环境 smoke 复现
├── GNE-273 VERIFY-07 v0.3.0 结论
└── GNE-274 VERIFY-08 产品扩展判定

GNE-298 TEMPLATE
├── GNE-301 TEMPLATE-01 [ARCH] 提取边界、三仓职责与生成清单
├── GNE-302 TEMPLATE-02 [BUILD/UI] 独立母版候选、中性产品壳与必要 UI
└── GNE-303 TEMPLATE-03 [VERIFY/QA] Smoke Product、空库重建与独立部署验收
```

`GNE-298` is blocked by `GNE-234` and is the only TEMPLATE parent in the MVP3
sequence. Its children remain `No milestone`, carry no labels, and execute in
the fixed order `GNE-301 -> GNE-302 -> GNE-303`; automatic orchestration must
stop after the selected child. The current research repository may use its
normal verified branch/PR flow, while creating or writing a new candidate or
Smoke GitHub repository and configuring a Vercel test project require explicit
approval for that execution.

GNE-301 is the documentation-only architecture gate. Its binding repository
outputs are `specs/template/product-spec.md`, `engineering-spec.md`,
`extraction-manifest.md`, `quickstart.md`, `test-plan.md`, and `acceptance.md`.
It classifies the current routes, imports, assets, packages, and all 18 source
migrations without moving runtime code or creating a candidate. GNE-302 must
consume this boundary and may not silently redefine it during implementation.

GNE-240 owns detailed package dependency rules for the GNE-229 parent. GNE-242
uses the MVP3 target namespace directly: `@xwlc/core`, `@xwlc/ui`,
`@xwlc/platform`, and `@xwlc/db`. The old `@starter/*` workspace namespace is no
longer the implementation target. GNE-240 did not create `packages/platform` /
`packages/db`; GNE-241 created those minimal public entries as contracts only.
The durable rules live in
`specs/platform/*`: product-specific cat-care objects stay out of platform
packages, package consumers use public exports rather than internal paths,
browser code must not import server-only modules, provider SDK / service-role
usage stays behind platform/server facades, and common packages must stay
runtime-agnostic instead of binding directly to Next.js, Vercel, Cloudflare, or
Hono request/response types.

GNE-240 also records the Auth contract boundary for future portability: common
packages may define actor/session/auth-result contracts, owner checks, auth
errors, and RLS expectations; the current Next.js/Vercel Supabase SSR behavior
belongs in the app adapter; a future Hono/Cloudflare path should add a Worker
adapter rather than rewriting reusable packages.

GNE-242 was clarified after the GNE-241 public-entry review: it is not only a
future Reference Product task, and it is not a directory-moving exercise. It
must prove package consumption from two sides. First, at least one existing
`apps/web` MVP1/MVP2 real chain should consume a package public entry without
regressing current pages. Second, the Reference Product minimum entry or module
should consume package public entries without deep imports. High-risk existing
chains such as Payment/Billing, AI Credit usage, webhooks, and Supabase SSR
cookie/session adapter do not need broad behavior rewrites in GNE-242, but they
must receive a package-contract audit conclusion: `uses_public_contract`,
`adapter_only_ok`, or `gap_deferred`. `adapter_only_ok` is valid for runtime
adapters that should stay in `apps/web`; `gap_deferred` must name the later
issue or stage. MVP5 owns live payment production readiness, not a blanket
excuse to leave MVP3 package-contract usage unexamined.

GNE-242 implementation keeps the same boundary: existing `apps/web` code can
consume package public exports without moving MVP1/MVP2 pages into
`packages/*`. The first app consumers are demo data owner scope via
`@xwlc/db` and Auth email-verification checks via `@xwlc/platform`. The
Reference Product minimum entry lives on the app/product side and consumes
`@xwlc/platform`, `@xwlc/db`, and `@xwlc/ui` public exports. Payment,
AI Credit usage, webhook, and Supabase SSR cookie/session behavior are audited
in `specs/platform/acceptance.md` instead of being broadly rewritten in this
child issue.

The 30-minute Reviewer Runbook lives in `GNE-234 VERIFY`, not as a standalone
issue. It is the final verification script for page flow, Supabase data/RLS,
Vercel deployment/env, PostHog events, GitHub CI, package version, schema
version, and patch-upgrade evidence.

Execution tasks remain as child issues under the parent issue tree below.
Examples: `GNE-180` through `GNE-183` stay under `GNE-167`. The old Product
Validation Kit route was canceled and then manually removed from the active
Linear planning view on 2026-06-26. Its CP tasks are not current execution
sources and should not be moved into MVP4-MVP6. If any old idea is still useful,
rewrite it into the new `GNE-228..GNE-234` structure instead of reviving the
legacy route.

## Baseline Issue Tree

Created on 2026-06-17.

```text
GNE-11 FOUNDATION-00 [FOUNDATION] GitHub 仓库基础与 AI 协作规则
├── GNE-14 FOUNDATION-01 [DOC] 写好 README：说明工程目标、结构、分工和 SDD 流程
├── GNE-76 FOUNDATION-02 [DOC] 建立 AGENTS.md 与 Codex 执行规则
├── GNE-77 FOUNDATION-03 [DOC] 建立 context 项目上下文文档
├── GNE-78 FOUNDATION-04 [DOC] 建立 SDD 规格模板
├── GNE-79 FOUNDATION-05 [DOC] 建立第三方集成文档模板
├── GNE-80 FOUNDATION-06 [CI] 配置基础检查：lint、typecheck、build
└── GNE-116 FOUNDATION-07 [DOC] 建立 Supabase 多人数据库协作规范

`GNE-76` remains the Foundation owner for AI execution rules. On 2026-06-23,
the engineering tradeoff guidance was moved out of the main Codex workflow
surface into `context/engineering-decision-rules.md`, with
`context/codex-rules.md` keeping only a lightweight trigger and reference. The
root `AGENTS.md` stays intentionally small. The new rules cover implementation
choices, untrusted retrieved/model/tool output, contract compatibility, and
verification selection; they do not override acceptance criteria, specs,
integrations, security rules, `AGENTS.md`, or project workflow.

MVP1/MVP2 structure review on 2026-06-23 found the current code ownership
reasonable: `packages/core` owns reusable contracts and pure logic, `apps/web`
owns routes, provider wiring, UI, and service boundaries, `specs` owns module
intent, `integrations` owns provider operations, and `context` owns project
memory. No runtime refactor is required for this governance update. Future
refactor candidates are `apps/web/lib/services/payment.ts` and
`apps/web/app/account/billing-overview.tsx` if they become difficult to review,
test, or edit in parallel.

GNE-70 APP-00 [APP] 产品外壳与可复用 UI
├── GNE-81 APP-01 [APP] 初始化 Next.js + TypeScript Web 应用
├── GNE-82 APP-02 [APP] 建立应用外壳：导航、布局、基础页面容器
├── GNE-83 APP-03 [UI] 建立首页与营销落地页基础模板
├── GNE-84 APP-04 [UI] 建立 Dashboard 基础框架
├── GNE-85 APP-05 [UI] 建立空状态、加载状态、错误状态和长内容约束
└── GNE-165 APP-06 [I18N] 建立全局中英双语与界面文案约束

GNE-132 DATA-00 [DATA] 最小数据模型、migration 与 RLS 模板
├── GNE-134 DATA-01 [DOC] 定义数据建模边界与最小表结构
├── GNE-135 DATA-02 [DEV] 建立基础 Supabase migration：user_profiles 与 demo_items
├── GNE-136 DATA-03 [DEV] 建立 RLS policy 模板：owner-only、public-read、service-only
├── GNE-137 DATA-04 [DEV] 建立 seed.sql 与本地 reset 验证入口
└── GNE-138 DATA-05 [TEST] 验证 migration、seed 与 RLS 权限边界

GNE-133 API-00 [API] Service 层与业务访问模板
├── GNE-139 API-01 [DOC] 定义页面、service、provider、database 的调用边界
├── GNE-140 API-02 [DEV] 建立 Supabase client/server helper 边界
├── GNE-141 API-03 [DEV] 建立 demo service：读取和创建 demo_items
├── GNE-142 API-04 [DEV] 建立输入校验、权限与错误返回格式
└── GNE-143 API-05 [TEST] 验证页面不直接散落查库，高权限逻辑不进客户端

GNE-5 AUTH-00 [AUTH] 主流登录系统集成：注册、登录、会话和用户资料
├── GNE-86 AUTH-01 [DOC] 编写 Supabase Auth 集成边界
├── GNE-87 AUTH-02 [DEV] 实现注册、登录和退出
├── GNE-88 AUTH-03 [DEV] 实现会话读取和受保护路由
├── GNE-89 AUTH-04 [DEV] 建立用户资料和账户设置页
├── GNE-163 AUTH-05 [ANALYTICS] 建立 Supabase Auth 的 PostHog 埋点
└── GNE-90 AUTH-06 [TEST] 验证完整登录链路与 PostHog 事件

GNE-190 MVP2-KNOW-01 [DOC] 商业化扩展底座共识与执行路线（Done）

GNE-71 MVP2 BILLING-00 [BILLING] 计费、订阅与权益模型（Done）
├── GNE-91 BILLING-01 [DOC][MVP2] 定义计费领域模型、状态流转与事实来源（Done）
├── GNE-191 BILLING-02 [DATA][MVP2] 建立最小 Billing 数据模型与 migration 草案（Done）
├── GNE-92 BILLING-03 [CORE/API][MVP2] 建立权益判断接口与 Billing service 边界（Done）
├── GNE-93 BILLING-04 [CONFIG][MVP2] 建立 pricing plan 配置模型（Done）
├── GNE-94 BILLING-05 [DEV][MVP2] 建立订阅状态和生命周期处理（Done）
├── GNE-157 BILLING-06 [AI][MVP2] Token allowance、credit 与 usage entitlement 模型（Done）
├── GNE-95 BILLING-07 [TEST][MVP2] 验证权益、订阅状态与账本边界（Done）
└── GNE-197 BILLING-08 [APP/REVIEW][MVP2] 建立账户 Billing 验收面（Done）

Billing reviewer surface: MVP2 owns `packages/core/src/billing.ts`, `specs/billing/*`, `supabase/migrations/20260621130735_create_billing_foundation.sql`, `apps/web/lib/services/billing.ts`, the minimal `/account/billing` Plans page, and the AI-facing Billing evidence on `/account/usage`. Reviewers should be able to confirm Free / Plus / Pro / AI credit-pack config, domain rules, migration/RLS shape, service boundary, visible plan differences, plan records, credit-pack records, and usage records before Payment, AI, or MVP3 consume Billing.

GNE-72 MVP2 PAYMENT-00 [PAYMENT] 支付底座与真实 Provider 验证边界（Done）
├── GNE-192 PAYMENT-01 [DOC][MVP2] 支付模块范围、订单模型和 Provider 架构（Done in repo）
├── GNE-98 PAYMENT-02 [DATA][MVP2] 建立支付数据模型与 payment_events 幂等边界（Done in repo）
├── GNE-96 PAYMENT-03 [DEV][MVP2] 实现 PaymentProvider interface 和 SandboxProvider（Done in repo）
├── GNE-97 PAYMENT-04 [DEV][MVP2] 实现 checkout / webhook / entitlement 最小闭环（Done in repo）
├── GNE-198 PAYMENT-04R [APP/REVIEW][MVP2] Sandbox checkout 与支付结果人工验收页（Done in repo）
├── GNE-104 PAYMENT-05 [ANALYTICS][MVP2] 接入 PostHog 支付事件（Done in repo）
├── GNE-202 PAYMENT-06 [DOC][MVP2] 补充 .env.example 和支付安全说明（Done in repo）
├── GNE-99 PAYMENT-07 [RESEARCH][MVP2 可选] 真实支付 Provider 人工验证清单（Done）
└── GNE-100 PAYMENT-08 [SPIKE][MVP2] Creem test checkout 与 webhook 技术打样（Done）

`PAYMENT-01..06` plus `PAYMENT-04R` are the MVP2 Payment mainline. `PAYMENT-07/08` are optional research/spike work: `GNE-99` asks a human to verify whether Creem/Dodo/Paddle/Alipay/WeChat Pay can actually support the team's account, product, test mode, webhook, payout, and risk requirements; `GNE-99` output `Go test mode` for Creem only, and `GNE-100` completed the Creem test-mode checkout/webhook spike. The accepted evidence chain is: app checkout -> Creem test payment -> Vercel `/api/payment/webhook` -> Supabase `payment_events` -> Billing credit grant -> PostHog server-side payment events -> `/account/usage` Credit increase. Production KYC/live payment remains blocked by missing real vertical product readiness and is tracked by `GNE-201`, not by MVP2. `specs/payment/acceptance.md` is synced to this Done state and records the latest verification snapshot; `/account/payment` should describe Creem as a real external adapter running in test mode only, not as live payment.

Stash audit note: the old `codex-before-sync-main-20260623` stash was reviewed across MVP2 Integrations, Billing, Payment, AI, and Analytics. It was not applied wholesale because current `main` superseded the Payment/Creem runtime. Useful Analytics dashboard/template content was merged manually into `integrations/analytics.md` under `GNE-73`; the remaining stash was later dropped after the team confirmed no further cherry-pick was needed.

Payment reviewer surface: reviewers must be able to follow `/account/billing` or `/account/usage` entry -> `/account/payment` checkout started -> `/account/payment/sandbox` -> success, cancel, or failure result -> current Billing order/subscription/entitlement status. Success URLs record navigation only and must not directly grant entitlement. MVP2 defaults to SandboxProvider. Real provider work is research/test-mode only until a real vertical product reaches the MVP5 production-payment gate.

GNE-73 MVP1-MVP3 ANALYTICS-00 [ANALYTICS] 统一事件标准、生产验收与转化看板（Done）
├── GNE-101 ANALYTICS-01 [DOC][MVP1] 事件命名、shared properties 与隐私边界（Done）
├── GNE-123 ANALYTICS-02 [DEV][MVP1] 建立产品级 analytics 配置与环境变量入口（Done）
├── GNE-102 ANALYTICS-03 [DEV][MVP1] 建立 PostHog adapter、no-op 与 shared properties 注入（Done）
├── GNE-103 ANALYTICS-04 [DEV][MVP1] 接入 Auth 与 pageview 转化事件（Done）
├── GNE-105 ANALYTICS-05 [TEST][MVP2] 验证 Production PostHog 事件接收与字段完整性（Done）
├── GNE-124 ANALYTICS-06 [DOC][MVP2/MVP3] 建立 PostHog 漏斗和看板模板（Done）
├── GNE-122 ANALYTICS-07 [DOC][MVP2] 定义多环境与多产品数据查看约定（Done）
├── GNE-125 ANALYTICS-08 [TEST][MVP2/MVP3] 验证单 Project 多环境/多产品数据隔离（Done）
└── GNE-159 ANALYTICS-09 [AI][MVP2] AI 使用量、成本与转化事件看板（Done）

Payment-specific analytics execution moved to `GNE-104 PAYMENT-05` under the Payment parent. MVP3 Reference Product activation/core-feature analytics belong under `GNE-233 CAPABILITY` and its analytics child issue, not under the retired Product Validation Kit route. Analytics keeps the shared event standard, privacy boundary, dashboard ownership, and review conventions; it is not a payment, order, entitlement, AI usage, or quota source of truth.

GNE-74 DEPLOY-00 [DEPLOY] 部署、环境变量与线上验收
├── GNE-107 DEPLOY-01 [DOC] 建立环境变量清单与 .env.example
├── GNE-106 DEPLOY-02 [DOC] 编写 Vercel 部署规范
├── GNE-108 DEPLOY-03 [DEPLOY] 配置 Vercel Preview / Production 部署入口
├── GNE-185 DEPLOY-04 [TEST] 验证 Vercel 线上环境访问 Supabase
├── GNE-186 DEPLOY-05 [TEST] 验证 PostHog Production 埋点接收
├── GNE-109 DEPLOY-06 [TEST] 整合 Production Smoke Path 验收
├── GNE-110 DEPLOY-07 [DOC] 建立上线状态回写和故障排查记录
├── GNE-187 DEPLOY-08 [OPS] 建立生产监控与告警检查清单
└── GNE-129 DEPLOY-09 [DOC] 建立多环境 / 多产品配置预留清单

GNE-75 FUTURE GROWTH-00 [GROWTH] 通用增长营销与反馈闭环
├── GNE-111 GROWTH-01 [DOC] 定义 SEO baseline
├── GNE-112 GROWTH-02 [UI] 建立营销落地页模块
├── GNE-113 GROWTH-03 [DEV] 建立 campaign attribution 基础能力
├── GNE-114 GROWTH-04 [DEV] 建立用户反馈收集入口
├── GNE-115 GROWTH-05 [DOC] 整理推广渠道和发布 checklist
├── GNE-126 GROWTH-06 [DOC] 定义推广渠道与 UTM 命名规范
├── GNE-127 GROWTH-07 [DEV] 建立推广链接示例与 attribution 验证页面
├── GNE-128 GROWTH-08 [DOC] 建立增长复盘模板与行动规则
└── GNE-161 GROWTH-09 [AI] AI 产品 Demo 模板与落地页表达

Growth execution order remains intentionally separate from current MVP3
Reference Product execution. `GNE-75` is a Future / Backlog horizontal growth
parent, not an MVP3, MVP4, MVP5, or MVP6 execution parent. `GROWTH-01..09` is a reusable growth foundation sequence: SEO baseline
-> landing modules -> campaign attribution -> feedback -> launch checklist
-> UTM naming -> attribution verification -> retro template -> AI demo
expression. Product-specific owner dashboard, funnel events, activation, and
AI/payment validation for the current MVP3 route belongs under `GNE-228` through
`GNE-234`.

GNE-148 MVP2 AI-00 [AI] AI Provider、Usage、Credit 与 Entitlement 底座（Done in repo）
├── GNE-149 AI-01 [DOC][MVP2] 定义 AI provider、model、token、credit、entitlement 边界（Done in repo）
├── GNE-156 AI-02 [API][MVP2] 定义 AI service 与 server-only 调用边界（Done in repo）
├── GNE-150 AI-03 [DEV][MVP2] 建立 AI Provider Adapter 与模型配置结构（Done in repo）
├── GNE-151 AI-04 [DEV][MVP2] 建立 AI Service 示例：chat、completion、embedding（Done in repo）
├── GNE-152 AI-05 [DATA][MVP2] 建立 Token Usage 计量模型（Done in repo）
├── GNE-153 AI-06 [DEV][MVP2] 建立 Credit / Quota Ledger 与订阅额度关联（Done in repo）
├── GNE-154 AI-07 [DEV][MVP2] 建立 AI Entitlement Gate 与模型访问限制（Done in repo）
├── GNE-199 AI-10 [APP/REVIEW][MVP2] 建立 AI demo 与额度验收页面（Done in repo）
├── GNE-155 AI-08 [TEST][MVP2] 验证 AI key 安全、token 扣减幂等和额度边界（Done in repo）
└── GNE-160 AI-09 [DEPLOY][MVP2] 模型 Provider secrets、预算上限与 production smoke test（Done in repo）

AI reviewer surface: reviewers must be able to see an AI entry, input/prompt area, provider mode, entitlement or quota gate, mock/no-op or real result, usage or credit outcome, and failure states such as unauthenticated, insufficient entitlement, quota exhausted, model unavailable, and provider failure. Failed calls must not silently deduct credit.

GNE-199 repo implementation uses `/dashboard` as the AI input/result review
surface and `/account/usage` as the Credit balance, credit-pack top-up,
recharge-record, and consumption-record surface. `/account/billing` remains the
Free/Plus/Pro plan selection surface.

GNE-155 repo implementation adds `scripts/verify-ai-safety.mjs`, insert-first AI
Credit ledger commits, duplicate idempotency detection before provider
invocation, `0 Credit` duplicate retry outcomes, and safe server-side AI
analytics summary events. It does not add a real AI provider or provider key.

GNE-160 repo implementation adds the server-side `AI_BUDGET_LIMIT`
single-request Credit cap, keeps AI provider secrets server-only, extends the AI
safety check, and records production AI smoke criteria in deployment memory.
Real-provider production smoke is still `not_run` until a provider is
configured, deployed, and verified.

GNE-148 repo completion closes the MVP2 AI foundation locally. The accepted
review path is `/dashboard` for AI input/result, `/account/usage` for Credit
balance/top-up/records, and `/account/billing` for plan selection. The parent
does not claim real-provider production smoke, which remains a future deployed
verification step. `specs/ai/acceptance.md` is synced to this Done state and
records the latest local verification snapshot while keeping real-provider
production smoke as `not_run`.

GNE-152/GNE-153 repo implementation uses the existing Billing ledger tables:
successful workspace mock text generation writes provider usage measurement into
`billing_usage_ledger.metadata`, writes a linked `billing_credit_ledger`
`consume` event, and surfaces the committed Credit consumption on `/dashboard`
and `/account/usage` without storing raw prompts or generated output in ledger
metadata.

GNE-154 repo implementation adds model-level access policy to the AI model
catalog and evaluates the selected model against the Billing snapshot before
provider adapter creation. The workspace AI form exposes configured text model
choices; reserved or inaccessible models return explicit blocked states, consume
`0 Credit`, and do not write committed usage.

GNE-167 MVP2 INTEGRATIONS-00 [INTEGRATIONS] Provider matrix、环境变量与 adapter 底座
├── GNE-180 MVP2-INT-01 [DOC][MVP2] 建立 provider matrix 与阶段边界
├── GNE-181 MVP2-INT-02 [DEV][MVP2] 建立 provider interface、mock/no-op adapter 与目录约定
├── GNE-182 MVP2-INT-03 [DOC/DEPLOY][MVP2] 标准化 env 命名、public/secret 分层与示例模板
└── GNE-183 MVP2-INT-04 [TEST][MVP2] 验证 provider 配置、no-op 行为与 secret 不泄漏

GNE-193 MVP4 INTEGRATIONS-00 [INTEGRATIONS] 海外/国内双模式 adapter、env 模板与上线 checklist

GNE-228 MVP3-01 PLAN [DOC/ARCH] 范围、双底座架构与失败标准
GNE-229 MVP3-02 PLATFORM [ARCH] 基座 Package 化与产品消费
GNE-230 MVP3-03 DELIVERY [DEPLOY] Package 化后的交付门禁与部署回归
GNE-231 MVP3-04 PRODUCT [APP/DATA] 主人侧 Reference Product 最小业务闭环
GNE-232 MVP3-05 ACCESS [SECURITY] 私密分享、匿名访问与提交边界
GNE-233 MVP3-06 CAPABILITY [AI/BILLING/OUTBOX/AUDIT] 平台能力接入真实业务
GNE-234 MVP3-07 VERIFY [QA] 交叉验证、升级演练与 v0.3.0 结论
GNE-298 MVP3-08 TEMPLATE [ARCH/PRODUCT] 纯净基础母版候选

Retired legacy route, not current MVP3 execution:
The old Product Validation Kit parent and CP task line was replaced by
`GNE-228..GNE-234`, canceled in Linear, and then manually removed from the
active planning view on 2026-06-26. Do not assign new work to that route, do not
move it into MVP4-MVP6, and do not use it as reviewer scope. Recreate any still
valid idea inside the Reference Product parent/child structure instead.

GNE-201 MVP5 PAYMENT-00 [PAYMENT] 真实垂直产品生产支付准入

MVP3 reviewer surface: the Reference Product must be a clickable chain, not a
collection of backend tasks. The minimum human check is login/signup -> create
cat profile -> create care plan -> publish plan -> generate private link ->
anonymous sitter opens link -> sitter submits completion / note / exception ->
owner views result -> Supabase/Vercel/PostHog/GitHub evidence matches the page.

MVP3 delivery boundary: `GNE-230` is not a new deployment system and should not
repeat MVP1/MVP2 GitHub/Vercel/Supabase setup. It owns the package化后的交付门禁:
`apps/web` can consume `@xwlc/*`, CI catches package/import/boundary failures,
Reference Product migrations continue through repo migrations, deployed smoke
can reproduce the minimum product path, and failures can be classified as
app/package/env/migration/RLS/provider. Database rollback is not promised;
prefer app rollback, package contract fixes, feature flags, and forward fix /
expand-contract database changes.

MVP3 access boundary: `GNE-232` owns private-link and anonymous command
security. Token values must be high-entropy, stored only as non-reversible
digests, scoped to one resource, expirable, revocable, and safe against repeated
submits. Logs, analytics, and screenshots must not contain raw tokens.

MVP3 capability boundary: `GNE-233` must not block the PRODUCT or ACCESS
minimum path. Its internal order is Audit / Correlation ID -> Outbox -> AI draft
with human review -> Entitlement / Usage -> Sandbox / Test Mode -> Health /
Trace / Metrics.

GNE-267 implementation keeps `@xwlc/platform` root compatibility while splitting capability/share-gate internals, keeps runtime adapters in `apps/web`, uses the existing Outbox schema, and separates Billing Credit/usage coordination so same-key retry converges. Travel reuse is proven through the public package entry, not by moving CatCare DTOs into packages.

CAP-02 owner-visible audit addendum is folded directly into `GNE-262`, not a
third-level task. CAP-02 owns the owner-facing share/security activity surface,
private-link bearer-risk copy, and correlation id handoff needed for later
PostHog/Audit event stitching. It must not store raw share tokens, token hashes,
full notes, owner email, or private handoff text.
```

## Usage

Use Linear as the source of task progress and this repository as the source of implementation truth. When Linear and repository docs disagree, update the stale side before implementation continues.

## Project Documents

- Supabase 多人数据库协作规范: <https://linear.app/gnemux/document/supabase-多人数据库协作规范-04fd323ff596>
