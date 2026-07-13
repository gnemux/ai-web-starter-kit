# Project Status

## Phase

MVP1 foundation complete. MVP2 integrations provider foundation, Billing foundation, Payment foundation, AI foundation, and Analytics dashboard/observability foundation are complete locally and sealed on GitHub as tag `v0.2.0` (`26443d2`). MVP3 starts from this baseline. Real-provider AI production smoke remains `not_run` until a provider is configured and deployed.

## Completed

- Created initial repository structure.
- Added AI-readable project context and rules.
- Added SDD templates.
- Added integration document templates.
- Added monorepo package layout.
- Initialized local Git metadata.
- Created the Linear baseline issue tree under project `98f7dceca282`.
- Installed dependencies and generated `pnpm-lock.yaml`.
- Verified TypeScript projects and Next.js production build.
- Updated Linear milestones to match the M0-M7 project delivery tracks.
- Marked completed Linear issues as Done.
- Created GitHub private repository `gnemux/ai-web-starter-kit` and pushed the initial baseline to `origin/main`.
- Added Supabase collaboration workflow for local databases, Git migrations, staging, production, RLS, and PR checks.
- Created Linear issue `GNE-116` and project document for Supabase collaboration.
- Implemented app shell, Dashboard framework, and UI edge states for `GNE-82`, `GNE-84`, and `GNE-85`.
- Added Linear M2 DATA and M3 API milestones before Auth.
- Completed M2 DATA with specs, local Supabase config, migration, seed guidance, shared TypeScript data model types, and RLS verification.
- Synced M2 DATA Linear issues to Done.
- Documented Supabase remote link and Auth environment rules for collaborators.
- Applied M2 DATA migrations to Supabase staging project `<staging-project-ref>`.
- Hardened staging after Supabase advisors by fixing `set_updated_at` search path, optimizing RLS policies, and revoking public execution of `rls_auto_enable()`.
- Completed M3 API with reusable service result types, Supabase client/server helper boundaries, a demo `demo_items` service path, dashboard service example, and local verification.
- Added Linear issue `GNE-163` so M4 Auth includes PostHog analytics instrumentation.
- Added M4 Auth specs and implemented Supabase Auth services, protected routes, account/profile UI, and PostHog Auth event wrappers.
- Refined the visible product interface so landing, login/signup, protected dashboard, and account pages only present currently implemented capabilities.
- Added lightweight Chinese/English i18n with Chinese as default, cookie-backed global language switching, localized route copy, and i18n requirements in app-shell/auth specs.
- Removed obsolete static dashboard sample data from `packages/core` so future work consumes real service contracts instead of visual mock arrays.
- Retouched the visible product brand to `XWLC` with `eXtensible Web Launch Core` as the restrained subtitle.
- Made the landing page header Auth-aware so authenticated users see a compact account menu instead of a Login button.
- Added a global product footer with localized product links, capability categories, engineering resource notes, copyright text, and moved the language switcher into the footer.
- Simplified authenticated app shell navigation so work area pages use one primary nav, while the top header is reserved for account actions.
- Removed non-functional status cards from Dashboard and Account so protected pages focus on demo data testing and profile editing.
- Clarified footer slot copy so future teams understand where real product and engineering links can live.
- Reworked the landing page into a restrained, low-fidelity product-style first screen and changed sign out to return users to the landing page.
- Retouched the landing first screen typography and core layout so the product preview and sample points stay orderly on desktop and mobile.
- Simplified the landing first screen by removing the non-functional header sample nav and lower three-column slot band, keeping the hero content vertically centered.
- Fixed sign-out navigation so logout redirects from the server action to `/` and cannot be intercepted by protected-route refreshes.
- Fixed the landing login regression by keeping Supabase Auth proxy checks on protected routes only and making public landing account detection bounded and safely degradable.
- Completed MVP1 AUTH / M4 Auth verification and synced `GNE-5`, `GNE-87`, `GNE-88`, `GNE-89`, `GNE-90`, and `GNE-163` to Done in Linear.
- Historical note: Linear planning was once synced to the `GNE-172` MVP factory route, including the former `GNE-171` Product Validation Kit and early CP tasks. That MVP3 route has since been replaced by the Reference Product route.
- Closed the MVP2 integrations planning gap in Linear by upgrading `GNE-167` into the MVP2/MVP4 integrations entry and creating `GNE-180` through `GNE-183` for provider matrix, provider interfaces, env naming, and secret-leakage/config checks.
- Reworked Linear project milestone display so MVP milestones are assigned only to module parent issues; execution child issues use `No milestone` and are reached through their parent issue.
- Audited Linear child issues against the milestone display rule and updated `context/linear.md` so the local issue tree matches the current Linear parent/child structure.
- Synced `GNE-74` MVP1 DEPLOY Linear cleanup into the local issue tree: DEPLOY execution order now runs env/docs first, Supabase/PostHog production checks next, Production Smoke Path after that, and monitoring/multi-env tasks last.
- Aligned M4 Auth PostHog instrumentation with `GNE-172` MVP factory rules by adding shared event properties and switching successful signup/login events to `user_signed_up` / `user_logged_in`.
- Synced `GNE-73` MVP1-MVP3 ANALYTICS Linear cleanup into project docs: PostHog uses one Project for MVP1-MVP3 by default, events require `app`, `mvp_stage`, `market`, `env`, `version`, and `module`, and ANALYTICS child issues now follow spec -> config -> adapter -> Auth/pageview -> activation -> production verification -> dashboards -> multi-env isolation -> payment -> AI order.
- Added mirrored Vercel Git deployment gating at the repository root and `apps/web` so only `main` triggers automatic Vercel deployments; collaborator PR branches rely on GitHub CI plus local or maintainer-run preview checks under the current Hobby/private-repo constraint.
- Added collaboration workflow specs and AI branch-safety rules so future AI-assisted work starts from the correct branch, avoids reusing old task branches, follows PR plus owner review practices, and gives developers next-step guidance after key workflow actions.
- Added the project-level Sol orchestration contract and Codex Agent profiles so a new root thread can select exactly one current Linear child issue, route work to Sol/Terra/Luna, enforce review and publication gates, write allowed Linear progress, and stop without entering the next issue.
- Refined PR workflow rules so AI can create PRs with filled descriptions after push, while the default PR template stays generic and Supabase-specific checks are added only for Supabase-related changes.
- Organized MVP1 deployment environment templates: `.env.example` now documents separate Vercel Production and Preview entries with temporarily shared provider values allowed, local `.env.local` is aligned to the same key set, and runtime env readers treat empty fallback variables as unset.
- Added MVP1 deploy operations memory docs and specs for `GNE-110`, `GNE-187`, and `GNE-129`: deployment status writeback, production monitoring checklist, environment/product matrix, and AI recall/writeback rules.
- Synced the MVP2 Linear consensus into repository docs: `GNE-190` is now the MVP2 commercial expansion consensus document, while execution stays under `MVP2 INTEGRATIONS-00`, `MVP2 BILLING-00`, `MVP2 PAYMENT-00`, `MVP2 AI-00`, and `MVP1-MVP3 ANALYTICS-00`.
- Split Integrations stage boundaries in docs: `GNE-167` is MVP2 provider matrix/env/adapter foundation, and `GNE-193` is the MVP4 overseas/china adapter, env template, mock/test-mode strategy, and launch-checklist parent.
- Historical note: the former MVP3 Product Validation Kit planning kept Payment/AI on sandbox/mock/no-op paths and deferred live payment to the MVP5 gate. The live-payment boundary remains true, but the Product Kit route itself has been retired.
- Clarified Analytics stage status: `ANALYTICS-01..04` are MVP1 Done, while `ANALYTICS-05..11` cover MVP2/MVP3 production verification, dashboards, multi-env isolation, Payment conversion, and AI analytics.
- Recorded PostHog production event evidence for `GNE-105`: PostHog Activity shows production Vercel URL events including `Pageview`, `Identify`, `login_started`, and `user_logged_in`.
- Updated public app branding defaults so metadata, favicon, `.env.example`, analytics default app name, and environment matrix use `XWLC` instead of the old `ai-web-starter-kit` display name.
- Documented the Vercel Hobby / private repo merge-method rule: non-owner collaborator PRs should use `Create a merge commit` by default so the `main` deployment-triggering commit is owner-authored; already-reviewed blocked squash merges may be followed by an owner-authored no-op trigger commit.
- Completed `GNE-180` by adding the MVP2 provider matrix, integrations spec entry, and placeholder integration docs for Email, Storage, and SMS.
- Completed `GNE-181` by adding provider-neutral contracts in `packages/core`, app-side provider descriptors, and server-only sandbox/mock/no-op adapter landing points.
- Completed `GNE-182` by standardizing provider selectors, public/server-only env naming, `.env.example` placeholders, environment matrix guidance, and related integration docs.
- Completed `GNE-183` by adding the reusable provider configuration, no-op/mock/sandbox behavior, smoke path, and secret leakage checklist.
- Completed `GNE-167` as the MVP2 integrations provider foundation: matrix, adapter/interface landing points, env/public-secret rules, and reusable verification checklist are all reachable from repository entry points.
- Completed the MVP2 Billing foundation for `GNE-71`: Billing specs, internal integration notes, provider-agnostic core pricing/entitlement contracts, app Billing service boundary, a human-readable `/account/billing` Billing review surface, and a verified Supabase migration for orders, subscriptions, entitlements, credit ledger, and usage ledger.
- Added a manual GitHub Actions workflow for Supabase staging migrations so reviewed migration files can be pushed to staging with Supabase CLI instead of relying on Vercel application deployments.
- Aligned the repository M2 Supabase migration timestamps with the existing staging migration history so the staging workflow can continue from the pending Billing migration instead of failing on history drift.
- Synced the non-black-box reviewer rule for commercial and AI execution: Payment, AI, and MVP3 product validation work require page-level human acceptance paths in addition to service, database, and provider contracts. Current MVP3 applies this through the Reference Product route.
- Added explicit APP/REVIEW Linear tasks so page-level acceptance cannot be missed during child-issue execution: `GNE-197` for Billing Done, `GNE-198` for Payment, and `GNE-199` for AI.
- Completed `GNE-105 ANALYTICS-06`: production PostHog Activity now shows the deployed Vercel URL with the required shared properties, including the corrected `env=production`.
- Completed the MVP2 Payment sandbox foundation in the repository for `GNE-192`, `GNE-96`, `GNE-97`, `GNE-98`, and `GNE-198`: Payment specs, sandbox provider checkout sessions, protected `/account/payment` review surface, sandbox success/cancel/failure result pages, protected sandbox server action that writes trusted Billing facts, no-side-effect sandbox webhook acknowledgement, and an Account usage-gate reviewer entry that simulates AI usage before prompting upgrade or credit-pack payment.
- Synced the Linear Payment route cleanup into project docs: `GNE-72` is now the MVP2 Payment foundation and real Provider validation boundary; `PAYMENT-01..06` plus `PAYMENT-04R` are the mainline, while `PAYMENT-07/08` are optional Provider research/test-mode spike work; `GNE-158` moved to `MVP3-CP-10`; `GNE-201` owns future production payment readiness.
- Advanced MVP2 Payment analytics and env safety: `GNE-104` now emits server-side `checkout_started`, `payment_succeeded`, `payment_failed`, `payment_canceled`, `entitlement_granted`, and `quota_limit_reached` from trusted Payment/Billing service boundaries. `GNE-202` is complete in repo with `.env.example` and provider docs covering `PAYMENT_MODE`, `PAYMENT_LIVE_ENABLED`, `PAYMENT_PROVIDER_SECRET`, server-only secrets, and the MVP5 live-payment gate.
- Completed optional MVP2 Payment real-provider validation: `GNE-99` produced `Go test mode` for Creem, and `GNE-100` validated the Creem test-mode AI credit-pack path through app checkout, Vercel webhook, Supabase `payment_events`, Billing credit grant, PostHog server-side payment events, and `/account/usage` Credit increase. This closes `GNE-72` for MVP2 while keeping live payment, production KYC, payout, refunds, reconciliation, invoices, taxes, and real-customer payments under `GNE-201`.
- Audited `stash@{0}` (`codex-before-sync-main-20260623`) in `context/stash-audit.md` across MVP2 Integrations, Billing, Payment, AI, and Analytics: it must not be applied wholesale because current `main` already supersedes the runtime pieces; the useful Analytics dashboard/template content has been merged manually into `integrations/analytics.md` under `GNE-73`.
- Completed `GNE-149 AI-01`: added `specs/ai/*` and updated AI integration notes so provider, model, capability, token usage, Credit, quota, entitlement, ledger, server-only service boundaries, workspace sample placement, failure states, and Billing/Payment/Analytics ownership are defined before AI runtime work.
- Completed `GNE-156 AI-02`: added reusable AI service request/response contracts in `packages/core/src/ai.ts`, a server-only `apps/web/lib/services/ai.ts` boundary, and a controlled `POST /api/ai/text` route. The service validates input, checks the current account and Billing entitlement before provider invocation, and calls only the local mock/no-op provider adapter.
- Completed `GNE-150 AI-03`: expanded provider-neutral AI adapter contracts for text/chat/embedding/moderation, provider usage, finish reasons, and error mapping; added server-only AI model config and catalog with mock/no-op text and mock embedding models; added configured mock/no-op provider factories; and updated the AI service to resolve provider/model/cost config before entitlement preflight and provider invocation.
- Completed `GNE-151 AI-04`: added a workspace AI draft example on `/dashboard` that accepts product input, calls a Server Action backed by the server-only AI service, returns mock/no-op output without a real provider key, and shows provider mode, model, entitlement gate, estimated Credit, deducted Credit, and record state.
- Completed `GNE-152 AI-05` and `GNE-153 AI-06`: successful workspace mock AI generation now records provider usage measurement as safe Billing usage metadata, writes a linked `billing_credit_ledger` `consume` event, returns committed Credit outcome to `/dashboard`, and surfaces the new Credit consumption record on `/account/usage`.
- Completed `GNE-154 AI-07`: AI model config now declares model-level access policy, the AI service evaluates selected models against the Billing snapshot before provider adapter creation or Credit consumption, and the workspace AI form exposes standard, premium, no-op, and reserved text-model choices with explicit blocked states.
- Completed `GNE-199 AI-10`: `/dashboard` now provides the AI input/result review surface with model choice, server-side gate, provider mode, mock/no-op result or blocked state, and Credit outcome; `/account/usage` remains the AI Credit account for available Credit, plan-vs-pack source split, credit-pack top-up, top-up records, and Credit consumption records.
- Completed `GNE-155 AI-08`: AI safety verification now has a repeatable local script, AI Credit ledger commits use insert-first duplicate detection, repeated idempotency keys return `duplicate` with `0 Credit`, and AI service analytics emits only safe server-side started/completed/failed/quota summary events.
- Completed `GNE-160 AI-09`: AI deploy-readiness now has server-only env documentation, a server-side `AI_BUDGET_LIMIT` single-request Credit cap, production smoke pass criteria, deployment memory writeback, and extended `npm run test:ai-safety` coverage. Real-provider production smoke is documented as `not_run`.
- Completed `GNE-148 MVP2 AI-00`: all AI child issues are Done in repo and Linear; `/dashboard`, `/account/usage`, and `/account/billing` form the reviewer-facing AI workflow and commercial boundary; local AI safety, type, lint, browser, and secret checks passed while keeping real-provider production smoke explicitly outside the verified facts.
- Added reviewer-facing rules for Analytics, UI validation recovery, and Billing ledger interpretation: new instrumentation must use the local analytics wrappers and carry shared properties, correctable UI errors must recover from current input without refresh, and nullable Billing ledger links such as `billing_credit_ledger.entitlement_id` must be interpreted by event type and source.
- Added `context/engineering-decision-rules.md` so engineering tradeoff guidance stays discoverable without enlarging `AGENTS.md` or duplicating workflow rules. `context/codex-rules.md` now keeps only a lightweight trigger for implementation-affecting changes.
- Reviewed MVP1/MVP2 code ownership after the engineering-rule split. The current structure remains acceptable: reusable contracts and pure logic live in `packages/core`, app routes/service boundaries/provider wiring live in `apps/web`, module intent lives in `specs`, provider operations live in `integrations`, and project memory lives in `context`. No runtime refactor is required now; `apps/web/lib/services/payment.ts` and `apps/web/app/account/billing-overview.tsx` are future split candidates only if reviewability or parallel editing becomes painful.
- Historical note: the previous MVP3 Product Validation Kit plan had placed architecture preflight in `GNE-210`, owner-only project access in `GNE-174`, sandbox pricing interpretation in `GNE-177`, and production payment reconciliation in `GNE-201`. That Product Kit route has since been retired; keep the useful architecture concerns inside the new Reference Product route instead.
- Historical note: the previous MVP3 Product Validation Kit CP issues were renumbered once to match execution order. That CP line has since been retired and should not be used as current planning, while Growth remains a separate future/backlog foundation sequence.
- Hardened the MVP2 payment webhook route so external responses no longer expose internal service error messages, and extended the release-boundary check to prevent regression.
- Added MVP3 follow-up scope to Linear and project memory for multi-table commercial fact transaction/compensation strategy, runtime security headers before public validation pages, and abuse-prevention hooks for anonymous public write paths.
- Synced MVP2 Payment and AI acceptance evidence: `specs/payment/acceptance.md` and `specs/ai/acceptance.md` now reflect the completed local code/docs/test facts, include the latest verification snapshot, and keep Creem labeled as a real external adapter running in test mode only. `/account/payment` now shows Creem as `真实适配器 · 仅测试模式` / `Real adapter · test mode only` so reviewers do not confuse test-mode adapter validation with live payment.
- Fixed the protected-route login redirect so `next` preserves both pathname and query string, keeping deep-link context for checkout/result URLs after authentication. The release-boundary script now guards this behavior. A future behavior-test layer should be introduced deliberately under the current MVP3 Reference Product verification path instead of adding an ad-hoc loader during release hardening.
- Fixed the Payment shell's secondary auth redirect so `/account/payment/result?...` and `/account/payment/sandbox?...` preserve their full query string when an unauthenticated reviewer is sent through login. This keeps Payment result trust, sandbox return paths, and checkout review context aligned with the current regression-guard scope.
- Cleared the old `codex-before-sync-main-20260623` stash after audit. The useful Analytics documentation content had already been merged manually; the remaining stash is no longer a project input and must not be submitted with this release branch.
- Closed `GNE-209` in Linear as the PR #32 release-final regression bucket after PR #32 and PR #33 were merged. `GNE-209` is no longer an MVP2 open item; PR #34 is a separate Auth follow-up for duplicate signup messaging and post-confirmation return-to-login behavior.
- GitHub `origin/main` was tagged as `v0.2.0` after PR #34. This tag is the MVP2 sealed baseline for MVP3 planning and future implementation. Do not continue MVP3 work from old PR branches; sync latest `main` and branch from the `v0.2.0` baseline or a later reviewed `main` commit.
- Replaced the old MVP3 Product Validation Kit execution route with the new `MVP3 Reference Product：双底座架构与 Package 消费验证` milestone in Linear. Current MVP3 execution parents are `GNE-228` PLAN, `GNE-229` PLATFORM, `GNE-230` DELIVERY, `GNE-231` PRODUCT, `GNE-232` ACCESS, `GNE-233` CAPABILITY, and `GNE-234` VERIFY.
- Synced MVP3 planning with the 4-package convention: `@xwlc/core`, `@xwlc/ui`, `@xwlc/platform`, and `@xwlc/db`. MVP3 should not mix in a 5-package naming scheme unless a later v0.3.x decision explicitly splits packages after Reference Product evidence exists.
- Updated the MVP3 Linear milestone and parent issues for 小团队 execution: `GNE-228` through `GNE-234` now carry a linear dependency chain, parent descriptions act as navigation/boundary/acceptance charters, and the 30-minute Reviewer Runbook is explicitly owned by `GNE-234 VERIFY`.
- Created MVP3 child issues under their corresponding parent issues. PLAN pure-document child issues were later collapsed back into `GNE-228` after the milestone and parent issue absorbed their content; active execution children now start from `GNE-240` under PLATFORM and continue through `GNE-274` under VERIFY. Child issues intentionally have no Linear labels and should remain `No milestone`; `GNE-250 VERIFY-06`, `GNE-267 CAP-07`, and `GNE-274 VERIFY-08` cover real deployment reproduction, failure/retry/idempotency/degradation, and product expansion decision gaps. The final VERIFY order is GNE-272 evidence, GNE-250 deployment smoke, GNE-273 decision, then GNE-274 product extension.
- Retired the old MVP3 Product Validation Kit route from current planning: its parent/CP line was canceled or manually removed from Linear, is no longer an execution source, and should not be moved into MVP4-MVP6. `GNE-75` is now treated as `FUTURE GROWTH-00`, a horizontal Growth backlog parent outside the MVP3 Reference Product route.
- Strengthened the MVP3 Reference Product Linear milestone and execution issues for newcomer/reviewer readability: the milestone now includes dual-foundation, business-loop, data-flow, and reviewer-verification Mermaid diagrams; all seven parent issues now explain purpose, best-practice rationale, boundaries, code-architecture role, reusable-platform value, product value, reviewer actions, and verification method. Key child issues now include execution templates for glossary/diagrams, package boundaries, delivery evidence, product data model, share-token lifecycle, capability mapping, and the 30-minute Reviewer Runbook.
- Applied the follow-up MVP3 execution-quality review: the milestone now includes the final 5 questions, a code-directory mapping table, and a minimum child-issue construction template. `GNE-251` now carries the product ERD, minimum fields, RLS ownership, file-range hints, and non-goals; `GNE-259` carries the owner/anonymous permission matrix; page-flow child issues `GNE-252`, `GNE-253`, `GNE-257`, and `GNE-258` carry page-level Done criteria; `GNE-273` now has the v0.3.0 conclusion template; `GNE-274` now has the product-expansion decision checklist. The review suggestion to mechanically expand all 39 child issues was intentionally not applied; remaining child issues should be brought up to the minimum template when their parent enters active execution. A standalone MVP3 evidence document is deferred until real verification evidence exists.
- Applied the second MVP3 execution-risk review with scope control: accepted the need to harden thin child issues and parent sequencing, but did not duplicate the milestone/GNE-230/GNE-232 diagrams that already cover data flow, delivery flow, and token flow. `GNE-247`, `GNE-243`, `GNE-263`, `GNE-264`, `GNE-265`, `GNE-267`, and `GNE-251` were expanded with migration/schema rules, machine-checkable package boundaries, Outbox/AI/Billing/Fallback/idempotency details, and a unified Reference Product state model. The parent chain was reinforced as `GNE-228 -> GNE-229 -> GNE-230 -> GNE-231 -> GNE-232 -> GNE-233 -> GNE-234`; no Linear labels or extra issues were added.
- Clarified overlapping MVP3 child-issue boundaries: `GNE-248` owns minimum app/package/db version-location while `GNE-272` owns final evidence aggregation; `GNE-249` was canceled and merged into `GNE-230` so delivery failure handling stays a parent-level gate instead of a standalone operations track; `GNE-255` owns Product page analytics while `GNE-266` owns cross-capability PostHog correlation; `GNE-260` owns Access-stage security rules/audit while `GNE-270` owns final security negative verification.
- Re-scoped `GNE-230` DELIVERY to avoid repeating MVP1/MVP2 deployment work: it now validates only package化后的新增交付风险, namely `apps/web` consuming `@xwlc/*`, CI/package boundary coverage, Reference Product environment differences, migration-rule continuity, deployed smoke reproduction, and failure classification. `GNE-245..248` plus `GNE-250` remain the execution children; `GNE-249` is canceled/merged into the parent.
- Updated the Linear project status update for `Web 端的可商用模板`: the previous latest update was still `MVP1 完成，MVP2 开始` from 2026-06-21, so a new 2026-06-26 update now records MVP2 at 100%, the retired legacy MVP3 route, the current MVP3 Reference Product route, the seven parent issue sequence, and the next step to begin from `GNE-228`.
- Completed `GNE-240` after PR #37 was merged: package dependency direction,
  product-object boundaries, runtime-agnostic rules, and Auth contract vs
  adapter split are now the accepted PLATFORM boundary.
- Started `GNE-241` by creating contract-only public entries for
  `@xwlc/platform` and `@xwlc/db`. These entries define runtime-agnostic
  actor/session/auth-result, owner/email checks, email verification,
  analytics/outbox, schema version, RLS policy, owner/token scope, and DB
  evidence contracts. GNE-242 then moved the workspace namespace to `@xwlc/*`
  and proved app-side consumption. The package work still does not add
  migrations, implement CF/Hono, or move Supabase adapter code out of the app.
- Local GNE-241 verification passed with `pnpm typecheck`,
  `pnpm test:release-boundaries`, `git diff --check`, and targeted boundary
  searches over `packages/platform` plus `packages/db` for runtime/provider
  terms and Reference Product object names.
- Clarified GNE-242 after GNE-241 review: package-consumption validation must
  cover both an existing `apps/web` MVP1/MVP2 real chain and the future
  Reference Product minimum entry. Payment/Billing, AI Credit usage, webhooks,
  and Supabase SSR cookie/session adapter do not need broad rewrites in
  GNE-242, but they must be audited as `uses_public_contract`,
  `adapter_only_ok`, or `gap_deferred`; live-payment production readiness still
  belongs to GNE-201/MVP5.
- Started GNE-243 by adding `scripts/verify-package-boundaries.mjs` and wiring
  it into the root `pnpm test` chain. The check guards package public-entry
  imports, Reference Product business-object leakage, runtime-specific package
  dependencies, client-side service-role/server-only access, and explicit raw
  token/raw prompt/private submission telemetry fields. Local GNE-243
  verification passed with `pnpm test:package-boundaries`, `pnpm typecheck`,
  `pnpm test`, `pnpm build`, and `git diff --check`. A temporary negative sample
  using `@xwlc/platform/src/index` was verified to fail the boundary check, then
  removed; rerunning `pnpm test:package-boundaries` passed.
- Started GNE-244 package patch rehearsal on current `main` per repo-owner
  instruction, despite the usual task-branch rule. The rehearsal bumps
  `@xwlc/core`, `@xwlc/ui`, `@xwlc/platform`, and `@xwlc/db` from `0.1.0` to
  `0.1.1`, adds the public `@xwlc/db` `formatSchemaVersion` helper, and keeps
  the Reference Product minimum entry consuming package public exports. No DB
  migration, CF/Hono adapter, product business object, or deployment setup was
  added. Local verification passed with `pnpm test:package-boundaries`,
  `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build`,
  `HEAD /catcare` returning `200 OK`, and `git diff --check`.
- Completed GNE-244 after PR #42 was merged. Main CI passed, Vercel Production
  deployment reported `success`, the deployment URL redirected to Vercel SSO as
  expected for the protected deployment, and the reviewer confirmed the page
  opened. `GNE-229` PLATFORM is Done in Linear because `GNE-240` through
  `GNE-244` are all complete.
- Advanced GNE-230 DELIVERY with scope limited to package化后的新增交付风险.
  GNE-245 through GNE-248 are Done in Linear and documented as checklist gates:
  CI/package boundary coverage, Reference Product env delta, migration-rule
  continuity, and minimum app/package/db version facts. GNE-250 deployed smoke
  remains Backlog and `not_run / blocked by later MVP3 parents` until PRODUCT /
  ACCESS / CAPABILITY create the minimum deployed business path.
- Prepared the current tree for public-repo review by adding an MIT License,
  expanding ignore rules for local secrets/build artifacts/logs, documenting
  the README license and brand-asset boundary, and replacing current-doc real
  staging Supabase identifiers, Creem test object IDs, and operator email
  evidence with placeholders. Repo Owner accepted the remaining historical
  Supabase staging identifiers, Creem test object IDs, and operator-email
  evidence as non-blocking for public visibility, so no Git history rewrite is
  planned for this open-source preparation branch.
- Started GNE-231 PRODUCT on current `main` per repo-owner instruction, despite
  the normal task-branch rule. The corrected Reference Product direction is a
  CatCare product entry, not a generic starter page with explanatory cards:
  `/` is now product-first, `/login` uses CatCare account context, and
  `/catcare` is the protected owner workspace. The original foundation
  demo remains reachable through `/demo`, `/demo/login`, and `/dashboard`.
  CatCare's protected workspace hides `/dashboard` from primary nav and account
  menu so product flow and foundation validation are not mixed.
  Product data uses new cats, care
  plans, care tasks, and care submissions tables; common packages and database
  foundation capabilities are consumed rather than polluted with product
  objects. Deep product-specific entitlement, payment, AI Credit, AI draft,
  Audit, Outbox, and PostHog wiring remains under GNE-233; anonymous share
  tokens and sitter access remain under GNE-232.
- Started GNE-278 PRODUCT-00 as the active GNE-231 gate after reviewing the
  uploaded 10-screen CatCare high-fidelity handoff. The current binding
  prototype set is now the regenerated 13-screen split set under
  `specs/reference-product/prototypes/v6-regenerated-normalized/`; discarded
  prototype drafts and old boards were removed. The binding spec lives at
  `specs/reference-product/gne-278-product-flow.md`. The product model now
  includes lightweight daily events and food/treat/care items as AI generation
  inputs. CatCare MVP3 pricing is USD-first for the overseas Reference Product.

## Verification Snapshot

Latest MVP3 PRODUCT-00 design-gate update:

- Reviewed the uploaded CatCare prototype handoff README and 10 reference
  screens.
- Regenerated and confirmed the current 13-screen high-fidelity split prototype
  set under `specs/reference-product/prototypes/v6-regenerated-normalized/`.
- Applied the GNE-251 PRODUCT02 8-table CatCare data model migration to the
  linked remote Supabase test project through linked SQL after direct Postgres
  CLI paths failed with TLS EOF.
- Verified the remote PRODUCT02 tables: all 8 tables exist, RLS is enabled, 4
  owner policies exist per table, `authenticated` / `service_role` grants are
  present, REST Data API returns `200 ok` for each table, and migration history
  records version `20260629075823`.
- Updated Reference Product specs to make GNE-278 the page-map/prototype gate
  before expanding owner-side implementation.
- Applied the PM flow correction: PRODUCT now has a short first-run activation
  path where cat profile + recurring routine + scenario can generate the first
  AI/mock checklist. Food/care items and event history remain important
  product-loop inputs, but they are optional enrichments rather than blockers
  before the first value moment.
- GNE-278 was synced to Linear as Done after the PM correction. GNE-251 was
  merged as PR #44 and is Done; remote PRODUCT02 schema/RLS/REST evidence is
  captured in Linear and project specs.
- PRODUCT02 implementation now extends the Reference Product migration and
  TypeScript database types for `cats`, `care_routines`,
  `care_routine_items`, `care_items`, `care_events`, `care_plans`,
  `care_tasks`, and `care_submissions`. Existing app service selects were kept
  compatible with the expanded row shape.
- PM correction added: GNE-251 data-model acceptance is gated by real CatCare
  shell pages (Landing, login/register, authenticated default workspace,
  account/billing/usage entries), while full high-fidelity owner workflow stays
  in GNE-252/GNE-253.
- GNE-251 UI gate is now implemented locally: Landing CTA no longer routes to
  foundation demo, `/login` defaults to `/catcare`, account/payment
  shells hide `/dashboard` from nav and account menu, and footer product links
  keep CatCare/account/billing/AI Credit without `/demo` or `/dashboard`.
- Historical PR-scope note: earlier PRODUCT work mixed `GNE-251 PRODUCT-02 DATA`
  with temporary data-verification UI before `GNE-280 PRODUCT-01 UI/SYSTEM` was
  inserted. Current GNE-280 work is UI/SYSTEM only and must not claim completion
  of GNE-251 DATA, GNE-252 APP, ACCESS, or CAPABILITY.
- After PR #44, Linear status was corrected so GNE-280 is In Progress and
  GNE-252 is Backlog; PR #44 evidence must not be treated as completing those
  follow-up issues.
- Started GNE-280 PRODUCT-01 on branch `codex/gne-280-ui-system`. The first
  UI/SYSTEM decision is to keep the foundation demo, but isolate it under
  `/demo`, `/demo/login`, `/dashboard`, and `/demo/account*`. CatCare keeps `/`,
  `/login`, `/catcare*`, and `/account*` for now. Demo account,
  billing/order-record, and usage pages now use `/demo/account`,
  `/demo/account/billing`, and `/demo/account/usage`, while Demo Dashboard and
  Demo account redirects use `/demo/login`.
- GNE-280 binding UI reference is the confirmed 13-screen split prototype set
  under `specs/reference-product/prototypes/v6-regenerated-normalized/` plus
  `specs/reference-product/gne-278-product-flow.md`. Older prototype drafts
  were removed and must not drive implementation.
- GNE-280 route naming decision: `/catcare` is the canonical customer-facing
  product route and `apps/web/app/catcare` is the product app directory.
  `/reference-product*` is retained only as a legacy compatibility redirect to
  matching `/catcare*` routes. Product services moved to `apps/web/lib/catcare`.
  `/account/billing` now uses CatCare billing UI; `/demo/account/billing`
  remains the foundation demo billing surface.
- GNE-280 UI/SYSTEM update: CatCare surface now defaults away from Demo
  Dashboard in both account menu and workspace nav. `CatCareBrand` remains an
  app-level product component, not a `packages/ui` primitive. Landing/Login now
  use `apps/web/public/catcare/hero-handoff.png` as the high-fidelity CatCare
  visual asset.
- GNE-280 UI alignment update: `/catcare` owner workspace now follows the
  project-local v6 PRODUCT-00 board as an onboarding dashboard. The earlier
  data-verification forms were treated as temporary PRODUCT-02 validation UI,
  not the primary product experience; they are no longer part of the CatCare
  workspace. CatCare result navigation now points to `/catcare/results`, with a
  PRODUCT-01 results skeleton route in place.
- GNE-280 PM/UI critique update: the reasonable scope is to make Landing,
  Login, `/catcare`, `/account/billing`, and `/account/usage` feel like the
  real CatCare product before deeper DATA/APP work. Full CRUD, real AI
  generation, anonymous share-token security, and Order/Entitlement return stay
  out of GNE-280. `/catcare` now shows the four-step product loop: cat/routine
  context -> AI generated temporary checklist -> private sitter handoff ->
  owner review/paid recap. CatCare section skeletons now distinguish routines,
  one-off events, supplies, plans, and paid result triggers with product preview
  cards.
- GNE-280 product-quality consensus: CatCare is a small Reference Product, not a
  demo reskin. It must follow product delivery standards so MVP3 can validate
  whether the common foundation supports a real product. GNE-280 may not close
  while Landing/Login/workspace/billing still show engineering placeholders,
  fake plan/credit values, or CTAs that route primary users into validation
  forms instead of product pages.
- GNE-280 UI follow-up: `/catcare` no longer exposes the folded PRODUCT-02
  validation form as part of the product workspace. The owner dashboard now
  reads current Billing entitlements for plan/AI Credit display instead of
  hard-coded `Free` / `1 / 3`, computes onboarding progress from available
  product records, and sends the main CTA to `/catcare/plans`. CatCare billing
  now presents Free/Pro plus the separate AI Credit pack; the intermediate Plus
  starter-kit tier stays out of the CatCare billing surface.
- GNE-280 UI closing pass: removed the global footer from the product app shell
  so Landing/Login no longer expose cross-surface account/demo links, replaced
  the `CC` placeholder mark with an app-level CatCare mark, shortened the
  Landing first viewport so the product flow is visible sooner, removed
  user-facing engineering/Demo/Foundation wording from CatCare Login and
  section skeletons, changed the CatCare `/catcare` nav label to the owner
  workspace label, added dashboard plan/AI Credit cards and onboarding progress
  bar, moved remaining CatCare JSX copy into i18n, and renamed CatCare runtime
  service/action/component identifiers away from `ReferenceProduct*`.
  This remains PRODUCT-01 UI/SYSTEM only; real CRUD completion, private share
  token security, AI generation, and payment return are still later issues.
- Latest GNE-280 normalized-prototype cleanup: the only retained prototype
  source under `specs/reference-product/prototypes/` is now
  `v6-regenerated-normalized/` with 13 split screens and README. Older combined
  boards and intermediate drafts were deleted, and old prototype path references
  were removed from specs/context docs. Landing was tightened toward the v6
  single-board structure: product navigation, Hero, CatCare preview, flow strip,
  USD plan cards, and AI Credit card now live inside one rounded product canvas
  instead of separate starter-style webpage bands.
- GNE-280 implementation lesson: whole-page prototype crops are useful for
  visual reference but unsafe as final card assets when the bitmap includes
  text, borders, selected-state backgrounds, or clipped illustrations. CatCare
  product assets should be normalized into same-size files under
  `apps/web/public/catcare/` before component integration. SVG icon work should
  start from prototype/source crops and semantic names, then trace/repair into
  `apps/web/public/catcare/icons/traced/`; direct hand-drawn replacements are a
  last resort. The accepted icon baseline is unthinned prototype PNG ->
  `potrace` fill SVG; morphology-thinned variants are not the default.
  PRODUCT-02 forms/actions should not remain in GNE-280 UI/SYSTEM pages unless
  a page actually consumes them.
- Product opportunity added to MVP3 KNOW: accumulated daily events can later
  power paid text/video recap generation for social sharing. It is future
  CAPABILITY/GROWTH, not MVP3 core.
- GNE-280 handoff and parallel-work guidance now lives in
  `context/catcare-parallel-handoff.md`. Future CatCare PRODUCT/ACCESS/
  CAPABILITY threads should read it before editing pages, icon assets, product
  shell files, or Linear issue scope. It records the accepted prototype-to-page
  workflow, CatCare icon asset workflow, shared-file locks, and safe three-lane
  parallel split. A mirrored Linear document is attached to `GNE-231`:
  https://linear.app/gnemux/document/catcare-product-并行推进交接gne-280-后-92ccd8117db2

Latest MVP3 PRODUCT local verification:

- `supabase db reset --local` is currently blocked by local Colima/VZ:
  `failed to run attach disk "colima", in use by instance "colima"`.
  Non-destructive recovery attempts were made with `colima stop`,
  `colima start`, stale helper-process cleanup, `LIMA_HOME=... limactl list`,
  and direct `limactl start colima`; the disk lock persisted.
- Because local DB reset is blocked, local rebuild verification remains
  pending. Remote linked Supabase SQL/RLS/REST verification has passed and is
  recorded as current PRODUCT02 data-model evidence.
- Remote Supabase app credentials are configured in ignored local env and REST
  connectivity is valid. The PRODUCT02 migration was applied to the linked
  remote test project through linked SQL because direct Postgres CLI sessions
  (`db push`, `migration repair`, and supplied direct DB URL) still fail from
  this machine with TLS EOF. PostgREST schema was reloaded, all 8 PRODUCT02
  tables return REST `200 ok`, and migration history records version
  `20260629075823`.
- `pnpm test:package-boundaries` passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- `git diff --check` passed.
- GNE-280 rerun passed `pnpm typecheck`, `pnpm lint`,
  `pnpm test:release-boundaries`, `pnpm test:package-boundaries`, `pnpm test`,
  `pnpm build`, and `git diff --check`.
- GNE-280 UI critique follow-up rerun passed `pnpm typecheck`, `pnpm lint`,
  `pnpm test:release-boundaries`, `pnpm test:package-boundaries`, and
  `git diff --check`; local HTTP smoke on `http://127.0.0.1:3006` passed for
  `/`, `/login?next=/catcare`, `/catcare`, `/catcare/routines`,
  `/catcare/events`, `/account/usage`, and `/account/billing`.
- Latest GNE-280 UI follow-up rerun passed `pnpm typecheck`, `pnpm lint`,
  `pnpm test:package-boundaries`, `pnpm test:release-boundaries`, and
  `git diff --check`. HTTP smoke confirmed `/` and `/login?next=/catcare`
  return `200`, `/catcare` redirects to `/login?next=%2Fcatcare`, and
  `/account/billing` redirects to `/login?next=/account/billing` when signed
  out. Rendered text checks confirmed homepage/login no longer show
  `产品预留位`, `工程预留位`, `84k`, or fake OAuth connected states.
- Latest normalized-prototype cleanup rerun passed `pnpm typecheck`,
  `pnpm lint`, `pnpm test:package-boundaries`,
  `pnpm test:release-boundaries`, `git diff --check`, and old-prototype
  reference scan. Local HTTP smoke on `http://localhost:3000` passed:
  `/` -> `200`, `/login?next=/catcare` -> `200`, `/catcare` -> `307`
  `/login?next=%2Fcatcare`, `/account/billing` -> `307`
  `/login?next=/account/billing`, `/account/usage` -> `307`
  `/login?next=/account/usage`, `/demo/account/billing` -> `307`
  `/demo/login?next=%2Fdemo%2Faccount%2Fbilling`, and `/dashboard` -> `307`
  `/demo/login?next=/dashboard`.
- Local HTTP smoke on `http://127.0.0.1:3006` passed for `/` GET -> 200,
  `/login?next=/catcare` GET -> 200, `/catcare` signed out
  -> 307, `/account` signed out -> 307, `/account/billing` signed out -> 307,
  and `/account/usage` signed out -> 307.
- Dev server is running at `http://127.0.0.1:3006`.
- HTTP smoke passed: `/` -> 200, `/login?next=/catcare` -> 200,
  `/catcare` signed out -> 307 to `/login?next=/catcare`.
- Full authenticated browser smoke with local signup/cat/plan creation was not
  rerun after the PRODUCT02 schema expansion because local Supabase is blocked.

Latest GNE-253 owner-result update:

- Continued GNE-253 from the owner-side results/status lane, not ACCESS. The
  current implementation keeps `/s/[token]`, anonymous sitter pages, share
  token tables, live AI, live payment, and real entitlement/credit deduction out
  of scope.
- Added an app-layer CatCare result-summary helper for owner-visible plan
  states. It interprets real `care_submissions` rows, including the `abnormal`
  flag, and keeps the result timeline empty when no real submissions exist so
  the owner page does not pretend preview data is actual feedback. The helper
  stays under `apps/web/app/catcare/plans/` and does not move CatCare business
  objects into `packages/*`.
- Reworked `/catcare/plans/[id]/results` so the page leads with result status,
  completed/attention/pending counts, owner handoff notes, and result entries.
  The original execution calendar is now a secondary review section instead of
  dominating the result page.
- Updated `/catcare/results` copy and plan-card labels so the list stays
  lightweight and does not pretend summary-only data contains full submission
  details.
- Local verification for this update passed `pnpm typecheck`, `pnpm lint`,
  `pnpm test:package-boundaries`, `pnpm test:release-boundaries`, and
  `git diff --check`.
- Follow-up local verification passed `pnpm test`, `pnpm build`, and browser
  checks on `http://localhost:3001/catcare/results` plus two owner result
  detail pages. The published plan without submissions showed `待真实提交`; the
  closed plan without submissions showed `已关闭未执行`; both result timelines
  stayed empty instead of rendering owner preview tasks as real sitter feedback.

Latest local release-hardening verification:

- `pnpm typecheck` passed.
- `pnpm test:release-boundaries` passed.
- `pnpm test:ai-safety` passed.
- `pnpm test` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Local smoke on `http://127.0.0.1:3005` passed for login, dashboard, AI immediate validation, Payment test-mode copy, forged Payment result rejection, forged sandbox rejection, unauthenticated API guards, webhook safe errors, and protected Payment deep-link `next` preservation.

Boundaries still not claimed as verified production facts:

- Real-provider AI production smoke remains `not_run`.
- Creem is test-mode-only with `PAYMENT_LIVE_ENABLED=false`; live payment, production KYC, real refunds, reconciliation, invoices, taxes, settlement, disputes, and real-customer charges remain under `GNE-201`.

## Done Issues

- `GNE-11` FOUNDATION-00
- `GNE-14` FOUNDATION-01
- `GNE-76` FOUNDATION-02
- `GNE-77` FOUNDATION-03
- `GNE-78` FOUNDATION-04
- `GNE-79` FOUNDATION-05
- `GNE-80` FOUNDATION-06
- `GNE-70` APP-00
- `GNE-81` APP-01
- `GNE-83` APP-03
- `GNE-82` APP-02
- `GNE-84` APP-04
- `GNE-85` APP-05
- `GNE-107` DEPLOY-01
- `GNE-106` DEPLOY-02
- `GNE-132` DATA-00
- `GNE-134` DATA-01
- `GNE-135` DATA-02
- `GNE-136` DATA-03
- `GNE-137` DATA-04
- `GNE-138` DATA-05
- `GNE-133` API-00
- `GNE-139` API-01
- `GNE-140` API-02
- `GNE-141` API-03
- `GNE-142` API-04
- `GNE-143` API-05
- `GNE-5` AUTH-00
- `GNE-86` AUTH-01
- `GNE-87` AUTH-02
- `GNE-88` AUTH-03
- `GNE-89` AUTH-04
- `GNE-163` AUTH-05
- `GNE-90` AUTH-06
- `GNE-101` ANALYTICS-01
- `GNE-123` ANALYTICS-02
- `GNE-102` ANALYTICS-03
- `GNE-103` ANALYTICS-04
- `GNE-105` ANALYTICS-05
- `GNE-124` ANALYTICS-06
- `GNE-122` ANALYTICS-07
- `GNE-125` ANALYTICS-08
- `GNE-159` ANALYTICS-09
- `GNE-73` MVP1-MVP3 ANALYTICS-00
- `GNE-190` MVP2-KNOW-01
- `GNE-167` MVP2 INTEGRATIONS-00
- `GNE-180` MVP2-INT-01
- `GNE-181` MVP2-INT-02
- `GNE-182` MVP2-INT-03
- `GNE-183` MVP2-INT-04
- `GNE-71` MVP2 BILLING-00
- `GNE-91` BILLING-01
- `GNE-191` BILLING-02
- `GNE-92` BILLING-03
- `GNE-93` BILLING-04
- `GNE-94` BILLING-05
- `GNE-157` BILLING-06
- `GNE-95` BILLING-07
- `GNE-197` BILLING-08
- `GNE-192` PAYMENT-01
- `GNE-96` PAYMENT-02
- `GNE-97` PAYMENT-03
- `GNE-98` PAYMENT-04
- `GNE-198` PAYMENT-04R
- `GNE-104` PAYMENT-05
- `GNE-202` PAYMENT-06
- `GNE-99` PAYMENT-07
- `GNE-100` PAYMENT-08
- `GNE-72` MVP2 PAYMENT-00
- `GNE-148` MVP2 AI-00
- `GNE-149` AI-01
- `GNE-156` AI-02
- `GNE-150` AI-03
- `GNE-151` AI-04
- `GNE-152` AI-05
- `GNE-153` AI-06
- `GNE-154` AI-07
- `GNE-199` AI-10
- `GNE-155` AI-08
- `GNE-160` AI-09
- `GNE-209` release-final regression bucket
- `GNE-240` MVP3 PLATFORM-01 Package 边界与依赖方向
- `GNE-241` MVP3 PLATFORM-02 core/ui/platform/db 最小公开入口
- `GNE-242` MVP3 PLATFORM-03 apps/web 与 Reference Product 消费 Package
- `GNE-243` MVP3 PLATFORM-04 package build/typecheck/boundary 检查
- `GNE-244` MVP3 PLATFORM-05 Package patch 升级演练
- `GNE-229` MVP3-02 PLATFORM [ARCH] 基座 Package 化与产品消费
- `GNE-245` MVP3 DELIVERY-01 单仓 CI 覆盖与 package 交付门禁
- `GNE-246` MVP3 DELIVERY-02 Reference Product 环境差异确认
- `GNE-247` MVP3 DELIVERY-03 Reference Product migration 规范延续
- `GNE-248` MVP3 DELIVERY-04 app/package/db 最小版本定位
- `GNE-278` MVP3 PRODUCT-00 CatCare 高保真产品旅程、页面地图与付费触发点
- `GNE-251` MVP3 PRODUCT-02 猫咪档案、喂养习惯、用品、事件、照护计划、任务、提交数据模型

## In Progress Issues

- `GNE-231` MVP3-04 PRODUCT [APP/DATA] 主人侧 Reference Product 最小业务闭环
- `GNE-280` MVP3 PRODUCT-01 [UI/SYSTEM] V6 原型转标准 SaaS UI

## In Review Issues

None.

## In Progress

MVP2 foundation parents are complete locally and in Linear: Integrations,
Billing, Payment, AI, and Analytics. GitHub tag `v0.2.0` is the MVP2 sealed
baseline. `GNE-228` PLAN is Done. `GNE-229` PLATFORM is Done. `GNE-240`
is Done after PR #37 and records the accepted package boundary. `GNE-241` is
Done after PR #38 and adds minimal public entries for `@xwlc/platform` and
`@xwlc/db`. `GNE-242` is Done after PR #40 and proves package consumption from
existing `apps/web` chains and the Reference Product minimum entry while using
the MVP3 target `@xwlc/*` namespace. `GNE-243` is Done and turned the
package/import/runtime/privacy boundary into a machine-checkable CI gate.
`GNE-244` is Done after the package patch rehearsal, PR #42 merge, main CI, and
Vercel Production deployment observation. `GNE-229` PLATFORM is Done. `GNE-230`
DELIVERY is functionally complete for GNE-245 through GNE-248, while deployed
smoke stays deferred to GNE-250 after PRODUCT / ACCESS / CAPABILITY. `GNE-231`
PRODUCT is now the active MVP3 parent. `GNE-278` PRODUCT-00 and `GNE-251`
PRODUCT-02 are Done; `GNE-280` PRODUCT-01 UI/SYSTEM is active and must not close
until the CatCare UI reaches the agreed 90%+ V6 fidelity threshold. Production
payment remains deferred to `GNE-201`. Real-provider AI production smoke
remains `not_run` until provider configuration and redeploy.

Latest `GNE-280` local UI verification on 2026-07-01:

- Latest screenshot run used local dev server `http://localhost:3010`; previous
  local ports are not authoritative evidence.
- GNE-280 scope is limited to `/`, `/login?next=/catcare`, `/catcare`,
  `/account/billing`, and `/account/usage`. Full cat profile, routine,
  generated checklist, private share, sitter checklist, owner result, ACCESS,
  live AI, and live payment remain outside this issue.
- Responsive verification covered `1470x798`, `1366x768`, `1440x900`, and
  `1920x1080`. All five GNE-280 pages had `horizontalOverflow=false`.
  Landing/Login scroll vertically at low-height viewports and fit without
  vertical scroll at `1440x900` and `1920x1080`.
- Screenshot evidence is generated under
  `artifacts/gne-280-screenshots/` for local review only; `artifacts/` is
  ignored and must not be committed.
- 1470x798 screenshot set:
  `landing-1470x798.png`, `login-1470x798.png`, `dashboard-1470x798.png`,
  `billing-1470x798.png`, and `usage-1470x798.png`.
- Login submit no longer uses a Next Server Action. The form posts to
  `/login/auth`, which reuses the existing Supabase Auth service. A fake-login
  negative check now returns a normal auth failure instead of
  `UnrecognizedActionError`; screenshot:
  `/private/tmp/catcare-login-submit-r10.png`.
- `/catcare`, `/account/billing`, and `/account/usage` correctly redirect to
  login when signed out. Authenticated visual smoke used a disposable
  Supabase test user created through the configured test Auth project.
- UI baseline improved: Landing and Login no longer use viewport-height
  clipping; Dashboard sidebar icons, active state, onboarding icons, metric
  cards, and CTA now follow the CatCare product visual system; Billing and
  Usage copy now uses CatCare Free/Pro/AI Credit/sandbox semantics instead of
  starter/template wording.
- Current self-assessment versus normalized prototypes: Landing ~88-90%,
  Login ~87-89%, Dashboard ~84-86%, Billing/Usage ~75-80%. GNE-280 should not
  close until Dashboard and Billing/Usage are closer to the split prototypes.

Latest `GNE-252` product-quality and architecture update on 2026-07-06:

- CatCare owner flow now treats same-page create/edit/delete/publish/close
  operations as local product interactions: local server action, local UI state
  update, and CatCare toast feedback where the user remains on the same page.
- `redirect()` and broad `revalidatePath()` remain acceptable only for true
  route transitions, such as creating a new care plan and opening its detail
  page.
- The CatCare performance practice is now recorded in
  `specs/reference-product/catcare-ui-guidelines.md` and
  `context/catcare-parallel-handoff.md`: batch Supabase reads, invalidate the
  smallest useful product cache, do not query in per-card/per-task loops, and
  keep toast feedback outside unmounting cards/modals.
- Boundary decision: CatCare-only toast styling, action icons, autocomplete
  dictionaries, plan schedule heuristics, product dictionaries, and item/routine
  semantics stay in the app/product layer. They should not move to `packages/*`
  until a second product needs the same behavior without CatCare semantics.
- Structure decision: `apps/web/lib/catcare/product-service.ts` remains the
  current service boundary for GNE-252 owner-flow acceptance, but MVP3 should
  not keep building on the 5k-line service file. Add a dedicated PRODUCT
  architecture follow-up after GNE-252 acceptance and complete it before GNE-253
  results expansion, GNE-232 ACCESS share-link implementation, or GNE-233
  CAPABILITY AI/Billing gates add more CatCare branches. Split it by cats,
  routines, items, events, plans, and catalog/cache while keeping CatCare
  business types out of `packages/*`.

Latest `GNE-288` product-service architecture update on 2026-07-06:

- CatCare service implementation is now split under
  `apps/web/lib/catcare/product-service/` while preserving
  `apps/web/lib/catcare/product-service.ts` as the compatibility barrel used by
  existing pages and server actions.
- Domain modules now separate owner workspace reads, cats, routines, items,
  events, and plans. Shared product service types live in `types.ts`; select
  strings, cache TTLs, and default routine definitions live in `constants.ts`;
  internal shared cache loaders, normalizers, mappers, analytics helpers, and
  cross-domain utilities remain in `core.ts`.
- Boundary remains app/product-layer only: no CatCare business object, product
  dictionary, product icon, or CatCare service implementation moved into
  `packages/*`.
- The split is documentation-backed in
  `specs/reference-product/catcare-ui-guidelines.md` and
  `context/catcare-parallel-handoff.md`. Future CatCare service work should add
  behavior to the relevant domain module rather than growing a monolithic
  service file again.

Latest `GNE-253` owner UX/results scope update on 2026-07-06:

- GNE-253 `PRODUCT-05 [APP/UX]` is complete after GNE-288. PR #49 merged on
  2026-07-06 at merge commit `1190f64`; GitHub CI passed; Vercel Production
  deployment `5329868439` completed with `success`.
- Phase 1 must complete the owner-side plan confirmation UX baseline before
  expanding results: summarize plan confirmation by dates, cats, visit count,
  visit batches, key handoff notes, compact task editing, and execution
  calendar hierarchy.
- Phase 2 covers owner-visible result/status work: pending/published/closed/
  completed states, owner result hierarchy, owner-only mock submissions, and
  history cleanup.
- ACCESS remains out of scope: no `/s/[token]`, anonymous sitter submit/view,
  share-token table, live AI, live payment, or real credit/entitlement
  deduction.
- Current local implementation improves the owner confirmation/results baseline:
  plan detail now uses a compact confirmation summary, execution calendar day
  cards group work by visit batches and attention items, task editing shows
  active/inactive/new-task counts, and reusable task display helpers keep
  category/action formatting consistent.
- The CatCare routine page now preloads all current cat routine panels and
  switches selected cats locally. A hidden-panel regression caused by combining
  the HTML `hidden` attribute with Tailwind `grid` was fixed by synchronizing
  `display: none`; browser verification confirmed the URL, selected tab, and
  visible panel all change without a route reload.
- Owner result pages now distinguish real submissions from owner-side preview
  data. `care_submissions.abnormal` is mapped through the CatCare service layer;
  result summaries use real submission rows when present and otherwise show
  pending/closed empty states without generating fake feedback.
- Latest local checks for this patch: `pnpm typecheck`, `pnpm lint`,
  `pnpm test:package-boundaries`, `pnpm test:release-boundaries`,
  `pnpm test`, `pnpm build`, and `git diff --check` passed. Browser checks on
  `/catcare/results`, a published owner result detail page, and a closed owner
  result detail page passed with no horizontal overflow.

Latest `GNE-257` ACCESS anonymous view update on 2026-07-07:

- Scope: implement unauthenticated `/s/[token]` read-only sitter view backed by
  real `share_tokens`, `care_plans`, and `care_tasks` from the linked Supabase
  test environment.
- Non-goals: no anonymous submit, no owner navigation, no RLS rewrite, no live
  AI/payment/entitlement behavior, and no raw share token in repository docs,
  Linear, screenshots, logs readback, analytics, or committed code.
- Implementation adds a minimal anonymous DTO in the CatCare product service,
  exposes `getAnonymousCarePlanView()`, and renders `/s/[token]` with valid,
  expired, revoked, invalid, and unavailable states. The valid state only shows
  cat names, care dates, handoff notes, task categories, required/optional
  status, time hints, frequency, task titles, and instructions. It does not
  include owner email, owner/internal ids, billing facts, raw tokens, token
  hashes, or submission UI.
- Global mobile viewport metadata was added through Next's `viewport` export
  because browser QA showed the anonymous page was otherwise rendered as a
  scaled desktop layout on mobile.
- Online test Supabase verification inserted temporary share-token rows for
  active, expired, and revoked states, fetched production-built local pages for
  valid/expired/revoked/invalid states, confirmed status copy and no forbidden
  owner/billing/token text, then deleted all temporary rows.
- Mobile browser QA passed on production-built local server at 390px valid and
  375px invalid states: body/main widths matched viewport, no horizontal
  overflow, no owner navigation, no forbidden owner/billing/token text, and
  screenshots were captured under the local temp directory for reviewer
  evidence.
- Local checks after the viewport fix passed with `pnpm typecheck`,
  `pnpm lint`, and `pnpm build`; `pnpm build` reported `ƒ /s/[token]`.
- GNE-258 remains the next ACCESS issue for anonymous submit and field
  whitelist. GNE-259 remains the RLS acceptance issue; GNE-260 remains security
  negative/audit verification.

Latest `GNE-258` / `GNE-290` boundary correction on 2026-07-07:

- GNE-258 is no longer treated as PRODUCT-quality completion for the anonymous
  sitter experience. Its acceptable scope is ACCESS technical foundation only:
  anonymous submit through share token, real `care_submissions`, field
  whitelist, service-date/visit validation, duplicate/update handling, and
  owner result visibility.
- The V6 prototype drift across screens 06-11 is now tracked by `GNE-290`
  under `GNE-231`. That issue must restore the PRODUCT flow from
  `06-food-care-items.png` through `11-sitter-checklist.png` in order.
- GNE-290 acceptance must include desktop/mobile visual QA, icon/button
  baseline review, no horizontal overflow, and three-party review evidence:
  architecture boundary, UI/icon quality, and product interaction.
- Non-goals remain explicit: no live AI/payment/entitlement, no anonymous photo
  upload or Storage/RLS image flow, no anonymous paid-state display, and no
  CatCare business objects in `packages/*`.

GNE-290 progress on 2026-07-07:

- Current local branch has started the V6 06-11 restoration without changing
  database schema or moving CatCare business objects into `packages/*`.
- Frontend polish now covers 06 item-library table direction, 07 event timeline
  direction, 08 scenario/AI input step chain, 09 draft AI-review framing, 10
  private-share framing, and 11 anonymous mobile header/task flow improvements.
- Anonymous sitter flow now shows cat-specific vs `家庭共用` scope, uses a more
  human task category order after time ordering, opens the first incomplete
  available day, and collapses a visit/day after submission completion.
- Verification passed: `pnpm --filter @xwlc/web typecheck`, `lint`, `test`,
  `build`, `pnpm test:package-boundaries`, `pnpm test:release-boundaries`, and
  `git diff --check`.
- Browser QA evidence currently covers 390px anonymous invalid-link state:
  no horizontal overflow and no plan-data leakage. Owner-side 06-10 visual QA
  still needs an authenticated reviewer session; valid `/s/[token]` QA still
  needs an active real share token.

GNE-290 product-feedback correction on 2026-07-07:

- Project rules and product usability now explicitly override prototype copy:
  V6 prototypes are reference material for flow and information architecture,
  not a mandate to keep mixed Chinese/English labels or unfinished controls.
- 06 Food & Care Items was corrected after product review: category tabs now
  filter the list, visible UI no longer keeps English category labels, fake scan
  and package upload UI was removed from the shipped surface. The interim
  in-app SVG category-icon direction was later rejected by product review and
  superseded by the product glyph badge rework below.
- 07-11 visible page headings and status copy were cleaned to avoid exposed
  prototype labels, English suffixes, and `mock` wording in Chinese product UI.
- Updated browser evidence: 390px anonymous invalid-link page is Chinese-only
  for the page title area, has one H1, and keeps `scrollWidth=390` with
  `clientWidth=390`.

GNE-290 06-11 product-quality correction on 2026-07-07:

- Product rules were applied above literal prototype copying: Chinese-mode UI
  must not keep prototype English suffixes, unfinished scan/OCR controls, or
  mismatched product imagery as acceptance evidence.
- 06 Food & Care Items now uses one product-local item type source for labels,
  form choices, usage tags, and filters. Category tabs were browser-verified at
  390px to change the visible list (`猫砂（1）` after tapping `猫砂 1`) with
  `scrollWidth=390` and `clientWidth=390`.
- 06/07 food and routine surfaces temporarily used consistent in-app SVG
  pictograms, but this direction was later rejected because it lost product
  illustration quality. The current accepted direction is the product glyph
  badge rework below.
- Chinese-mode product copy now uses `智能摘要` / `智能额度` wording instead of
  exposed `AI/live AI/AI Credit` mixed copy across the owner flow, shell, plan,
  result, billing, and usage surfaces.
- Browser smoke on 390px covered `/catcare/items`, `/catcare/routines`,
  `/catcare/events`, `/catcare/plans`, and invalid `/s/[token]`; all checked
  pages kept `scrollWidth=390` with `clientWidth=390` and no prototype images
  in the inspected product pages. Valid active share-token QA is still pending.

GNE-290 active share-link mobile QA on 2026-07-07:

- Browser QA covered a valid temporary `/s/[token]` at 390px without recording
  the raw token in docs or final evidence.
- Evidence: anonymous page rendered `照护任务`, did not show owner navigation,
  showed cat-specific scope for `汤圆` / `饺子`, showed `家庭共用`, exposed submit
  controls only for the current/available day, and marked future days as
  `未到日期`.
- Interaction QA: opening the second visit collapsed the first visit (`第 1 次到访`
  changed to `展开`) and rendered the second visit's 11 task forms, avoiding a
  full-page task dump. The page kept `scrollWidth=390` and `clientWidth=390`.
- Cleanup was later completed through sandbox-external Supabase REST: the
  temporary online `share_tokens` row and the isolated QA owner data were
  deleted before PR/merge closure.

GNE-290 three-party product review on 2026-07-07:

- Architect score: 92/100. The shared additions stay inside the CatCare product
  boundary (`catcare-item-types`, `catcare-item-type-icon`) and do not move
  cat-specific business objects into common packages. ACCESS token hashing and
  anonymous submission logic remain in product service code.
- UI designer score: 91/100. 06/07 now use consistent pictograms instead of
  prototype image assets; Chinese-mode product copy no longer mixes exposed
  `AI Credit` wording; 390px owner and anonymous checks show no horizontal
  overflow.
- Product manager score: 91/100. The anonymous sitter flow now clarifies cats,
  `家庭共用`, current-day availability, future-day lockout, and visit-by-visit
  progression. Opening another visit collapses the previous one instead of
  showing an overwhelming task dump.
- This review was superseded by later UI feedback and is retained only as
  historical context.

This review result is superseded by the product-quality rework checkpoint below
because later PM/UI feedback rejected the inline-SVG product-object direction.

GNE-290 product-quality rework checkpoint on 2026-07-07:

- The previous three-party score is superseded by later product feedback. The
  hand-drawn inline SVG direction for item/task/event visuals was rejected and
  must not be used as Done evidence.
- Current rework restores the CatCare product icon production rule without
  rendering raw prototype PNG crops directly. Item categories, event rows, plan
  task lines, and anonymous sitter task cards now use product-local semantic
  glyphs through `catcare-item-type-icon.tsx`; PNG crops are reference material
  only.
- The events timeline now uses event-type icons plus severity badges instead of
  a dot-only timeline. The plan generation page no longer places history plans
  inside the AI input summary column; existing plans are a secondary management
  section below the generation flow. Published plan detail now reads as a care
  plan overview rather than only a private-share panel. Anonymous task cards now
  show category assets, family/cat scope chips, and a clearer mobile check-in
  hierarchy.
- Verification passed: `pnpm --filter @xwlc/web typecheck`,
  `pnpm --filter @xwlc/web lint`, `pnpm --filter @xwlc/web test`,
  `pnpm --filter @xwlc/web build`, `pnpm test:package-boundaries`,
  `pnpm test:release-boundaries`, and `git diff --check`.
- Local dev server is listening on `http://127.0.0.1:3003`. Sandboxed
  localhost access is blocked by `Operation not permitted`, but sandbox-external
  curl verified `/catcare/items`, `/catcare/events`, and `/catcare/plans`
  redirect to `/login?next=%2Fcatcare` when signed out, and
  `/s/invalid-token-smoke` returns `200 OK`.
- Mobile screenshot evidence: system Chrome captured
  `/private/tmp/gne290-invalid-390-r3.png` at 390px for invalid
  `/s/invalid-token-smoke`; the earlier horizontal text clipping was fixed by
  tightening the invalid-link copy and mobile wrapping.
- Cleanup evidence: sandbox-external Supabase REST cleanup deleted the earlier
  temporary online `share_tokens` row (`deleted_rows 1`).
- Latest local QA seed evidence uses an isolated online test owner and plan for
  GNE-290 visual QA only. Authenticated owner screenshots now cover 06-10, and
  active-token mobile screenshots cover 11:
  `/private/tmp/gne290-06-items-desktop.png`,
  `/private/tmp/gne290-07-events-desktop.png`,
  `/private/tmp/gne290-08-plans-desktop.png`,
  `/private/tmp/gne290-09-plan-detail-desktop.png`,
  `/private/tmp/gne290-10-private-share-mobile.png`,
  `/private/tmp/gne290-11-sitter-mobile.png`,
  `/private/tmp/gne290-11-sitter-mobile-tasks.png`, and
  `/private/tmp/gne290-11-sitter-mobile-accordion.png`.
- Screenshot metrics show no horizontal overflow for the captured viewports:
  owner desktop pages rendered at `scrollWidth=1440 / viewport=1440`; private
  mobile pages rendered at `scrollWidth=390 / viewport=390`.
- Local 3003 recovery evidence: a stale/corrupted Next dev `.next` cache caused
  CSS/runtime chunk failures (`Cannot find module './5846.js'`) and made the
  page look globally unstyled. After stopping 3003, deleting
  `apps/web/.next`, and restarting, sandbox-external curl verified
  `/login 200 OK` and `/_next/static/css/app/layout.css 200 OK` with
  `Content-Length: 73987`.
- Later cleanup evidence deleted the current isolated online QA owner/token rows
  before PR/merge closure.

GNE-290 test-readiness three-party review on 2026-07-07:

- Architect score: 92/100. The latest corrections remain inside CatCare product
  boundaries: product-specific assets/mappings stay under `apps/web/app/catcare`
  and `apps/web/public/catcare`, anonymous access logic remains under the
  product service, and no cat-care object was moved into common packages.
- UI designer score: 90/100. Screens 06-11 now use consistent product-local
  glyphs, readable status chips, stable desktop grids, and mobile private pages
  without horizontal overflow. Minor debt remains in disabled-share explanatory
  density on the owner detail page, but it is not a test blocker.
- Product manager score: 91/100. The sitter flow now explains authorization,
  family/cat scope, current-day availability, future-day lockout, and
  visit-by-visit execution before the long task list.

GNE-290 icon-quality correction on 2026-07-07:

- User visual QA rejected the previous product PNG icon pass because some icons
  carried baked-in white backing shapes, several event/category meanings were
  too generic, and the event timeline line visually ran through the marker
  container.
- Runtime category/event/task icons now use one product-local semantic SVG
  glyph system in `apps/web/app/catcare/catcare-item-type-icon.tsx` instead of
  rendering raw prototype PNG crops. The PNG crops remain only as reference
  material in the icon inventory.
- Event timeline markers now draw per-row connector segments behind each
  marker instead of one continuous line through the icon box.
- Follow-up UI review found the first semantic glyph pass too bare and
  engineering-like. The icons now render as colored product badges with
  category-specific tones, and the event timeline spine is stronger while still
  masked by each marker.
- Fresh final screenshots after the correction:
  `/private/tmp/gne290-final-06-items-desktop.png`,
  `/private/tmp/gne290-final-07-events-desktop.png`,
  `/private/tmp/gne290-final-08-plans-desktop.png`,
  `/private/tmp/gne290-final-09-plan-detail-desktop.png`,
  `/private/tmp/gne290-final-10-share-desktop.png`,
  `/private/tmp/gne290-final-11-sitter-mobile.png`, and
  `/private/tmp/gne290-final-11-sitter-mobile-tasks.png`.
- Captured pages stayed within viewport width: desktop pages
  `scrollWidth=1440 / viewport=1440`, mobile pages
  `scrollWidth=390 / viewport=390`.
- Verification passed after the correction:
  `pnpm --filter @xwlc/web typecheck` and
  `pnpm --filter @xwlc/web lint`,
  `pnpm --filter @xwlc/web test`,
  `pnpm --filter @xwlc/web build`,
  `pnpm test:package-boundaries`,
  `pnpm test:release-boundaries`, and `git diff --check`.
- After the production build check, local dev was restarted cleanly on
  `http://127.0.0.1:3003`; sandbox-external curl verified `/login 200 OK` and
  `/_next/static/css/app/layout.css 200 OK` with `Content-Length: 73987`.
- Final cleanup evidence: sandbox-external Supabase REST cleanup deleted the
  isolated GNE-290 visual QA owner data before closure (`share_tokens 1`,
  `care_tasks 7`, `care_plans 1`, `care_events 3`,
  `cat_item_assignments 12`, `owner_item_library 6`, `cats 2`,
  `user_profiles 1`, `auth_user 1`) and verified remaining counts were `0` for
  the inspected owner-scoped tables. The local raw token/password state file
  and temporary QA scripts were removed after evidence capture.

Latest `GNE-266` CAPABILITY hardening checkpoint on 2026-07-11:

- Cross-capability context and generic anonymous share-credential states now
  live in the runtime-agnostic `@xwlc/platform` public entry. Node crypto,
  CatCare persistence, anonymous-view DTOs, and product copy remain app-local.
- CatCare event names and property allowlists now live in a product analytics
  adapter. The shared transport accepts bounded primitives, protects envelope
  fields, rejects sensitive or opaque values, removes query/hash data, and
  redacts token-like path segments without depending on a product route name.
- PostHog server capture now uses the documented `/i/v0/e/` single-event
  endpoint. A validated context fan-out helper supplies the same object to
  Audit, Analytics, and other capability consumers; unsafe client generation
  identifiers are replaced with a server UUID before reuse.
- Three independent review rounds resolved value-smuggling and future-route
  redaction findings. Final evidence passed 48 web tests, 4 platform contract
  tests, full `pnpm test`, typecheck, lint, production build, package/release/AI
  boundaries, and diff checks. No UI, schema, or migration changed.
- The controlled local share GET returned `200`. Live PostHog event lookup in
  the connected project remains `not_run`: an opaque hash comparison proved
  the local env project token targets a different PostHog project. No token was
  printed, and this checkpoint does not claim cross-project observation.

GNE-267 local implementation checkpoint on 2026-07-12:

- Final local status: `READY` after independent Terra review and four bounded
  correction rounds. `@xwlc/platform` preserves its root API while capability
  context/share gate internals are split; Platform tests pass `5/5`, including
  a root-import-only Travel compile/consumption proof.
- The Outbox worker uses the existing table with status/attempt/time/update CAS,
  a five-minute processing lease, deterministic retry, three-attempt dead
  letter, internal-only failure categories, non-starving ready selection, and
  destination idempotency requirements.
- Billing/AI uses the existing usage states as a leased
  `reserved -> credit -> committed` saga. Active duplicates cannot mutate or
  invoke the Provider twice; stale reconciliation and every transition enforce
  `reserved` CAS. Provider execution has a 60-second timeout, throw/timeout
  writes a safe failure event and charges zero, and successful output can be
  returned with explicit accounting-pending state until reconciliation.
- Anonymous submission retries repair required Audit/Outbox effects. Audit
  idempotency is atomic through a deterministic UUID derived only from safe
  versioned fields; same-content retries collide on the primary key, while
  meaningful safe-content updates produce a new event ID.
- Final evidence passes Web tests `72/72`, Platform tests `5/5`, full-repo
  `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, AI safety,
  release/package boundaries, and `git diff --check`. No UI, schema, migration,
  live Provider, payment, or deployment configuration changed.
- Publication completed through GitHub PR #74 and merge commit `767e742`.
  Required GitHub CI succeeded, the Vercel bot's automatic deployment
  succeeded, and the stable shared test URL
  `https://ai-web-starter-kit-web.vercel.app/` returned `200`. The unique
  deployment URL returned the expected SSO `302`. No manual deployment,
  online database mutation/migration, live Provider call, or Provider
  configuration operation was performed.

Codex orchestration efficiency checkpoint on 2026-07-12:

- Sol is now the default writer for low/medium work it can safely complete;
  high risk requires independent review but does not automatically require a
  delegated implementation Agent.
- Normal execution is limited to at most one delegated writer and one
  independent reviewer, ordinarily sequential. `max_threads = 6` remains an
  exceptional capacity ceiling rather than a usage target.
- Writers run targeted checks, reviewers validate the stable diff and risk
  surfaces, and Sol runs the final full-repository verification once after
  fixes settle. Extra full-suite or review rounds require changed risk or a new
  blocking finding.

GNE-268 VERIFY baseline checkpoint on 2026-07-12:

- Added `specs/reference-product/reviewer-baseline.md` as the safe handoff for
  reviewer roles, test-data preparation, stable URL, deployed commit, package
  versions, schema evidence, cleanup, and downstream VERIFY ownership. It
  stores no passwords, raw share links, private care content, or provider
  secrets.
- Automatic Vercel deployment and GitHub CI passed for main commit `1c2de2c`;
  the stable validation URL returned HTTP 200 from `sin1`. This is an MVP3
  validation deployment over reference/staging/test providers, not evidence of
  a true production Supabase environment or a full product smoke pass.
- Read-only Supabase aggregates confirm CatCare, anonymous-share, Billing,
  entitlement, credit, and usage data categories exist. Only one owner
  currently owns CatCare cat rows, so the second reviewer identity must use a
  separate private credential and create data on demand or rely on the
  rollback-only isolation checks in GNE-270.
- Exact migration-history parity is not established: the repository contains
  16 migrations through `20260709013908`, while the connected test project
  records 11 history rows through `20260708124436`, with a different
  share-token migration timestamp. VERIFY-01 does not change the database;
  GNE-271 must reconcile this evidence before the final v0.3.0 decision.

GNE-252 plan-creation recovery checkpoint on 2026-07-12:

- GNE-269's deployed run proved that the submitted dates were valid; the new
  test cat had no reusable routine or enabled routine item. The service
  correctly rejected task generation, but the owner page mislabeled every
  validation failure as a date error.
- The product-local fix preserves the routine and date safety rules, maps
  validation fields to bounded `routine`, `date`, `cats`, or `validation`
  states, keeps only a valid selected cat UUID in the recovery URL, and gives
  the routine case a direct recovery action.
- `/catcare/plans?cat_id=...` now selects only the intended cat by default;
  plans opened without a target keep the existing plan-tier selection behavior.
- Local verification passes 76 Web tests, full lint/typecheck, package and
  release boundaries, production build, and `git diff --check`. Independent
  Terra review reported no P0-P3 blocker. PR #78 was merged as `0aa196a`; main
  CI and Vercel passed. The deployed no-routine recovery preserved the target
  cat, showed the routine CTA, consumed no AI unit, and created no plan.
- PR CI also exposed a pre-existing date-dependent Platform test: the
  unavailable-resource assertion omitted the explicit test clock and became
  `expired` on 2026-07-12. It now uses a pre-expiry clock, while the revoked
  assertion uses a post-expiry clock to preserve revoked-over-expired
  precedence. Platform `5/5` and the full root `pnpm test` pass without
  changing runtime behavior.

GNE-269 Reviewer Runbook completion checkpoint on 2026-07-12:

- After saving enabled routines for `GNE269 验收猫`, the deployed flow created
  and published one 2026-07-12 plan with six task definitions and seven
  scheduled executions. Mock AI plan generation moved usage from 19/65 to
  18/65; the same plan's stored result recap then moved it to 17/65.
- A fresh private link rendered the explicit anonymous boundary with no owner
  navigation. One safe completed result changed the first visit from 0/3 to
  1/3; the owner result page then showed one real submission out of six.
- Read-only cloud facts for the plan include owner `care_plan_published` and
  `share_link_created` Audit events, anonymous-token view/submission Audit
  events, and one correlated pending owner-notification Outbox row. Raw share
  credentials are excluded from repository and Linear evidence.
- The stored recap summarizes the real 1/6 result as one completion, no
  exception, five missing submissions, and no overdue item. Read-only ledger
  evidence contains one new committed `catcare_result_recap` usage and exactly
  one linked credit consume; the preceding unauthorized response wrote no usage
  row and caused no double-charge.
- Current safe totals are 3 cats, 5 plans, 83 task definitions, 25 submissions,
  4 active share tokens, 41 committed usage rows, 73 Audit events, and 8 Outbox
  rows. All Outbox rows remain pending; the Runbook records this state without
  running a worker or changing implementation.
- Reviewer decision is `go` for GNE-269. Repository/cloud migration-history
  reproducibility remains owned by GNE-271 and must close before the final
  v0.3.0 release conclusion. Do not enter the next child from this checkpoint.

GNE-270 security-negative verification checkpoint on 2026-07-12:

- Cross-owner, anonymous direct access, valid, expired, tampered, regenerated,
  revoked, whitelist/idempotency, and durable telemetry redaction checks pass.
  The bearer values remained browser-only and were not committed to evidence.
- The final test link was revoked and the tested plan has zero active share
  tokens. The temporary second-owner account and cascading CatCare rows were
  deleted from the shared cloud test project.
- A disposable local Supabase reset applied all 16 repository migrations.
  Four rollback-only ACCESS security SQL suites passed; Platform tests pass
  `5/5` and Web tests pass `76/76`.
- PostHog contains the share-view and link-created events. Their observed
  schemas contain bounded context/resource/result fields and no raw-token,
  token-hash, authorization, or bearer properties.
- Independent Terra review found and removed one historical full bearer URL
  from acceptance evidence. The repository-wide rescan found only explicit
  synthetic test fixtures; final review is `READY` with no P0-P3 finding.
- Foundation judgment: Travel can reuse the platform share gate, safe
  capability context, telemetry envelope, negative matrix, and adapter
  acceptance contract. Product stores, DTOs, whitelists, CatCare Audit event
  types, and the Supabase Outbox store remain application-local until a second
  real consumer proves the extraction seam.
- Exact cloud migration-history parity remains GNE-271 scope. This checkpoint
  does not close GNE-234 and must not automatically start GNE-271.

GNE-271 package/database upgrade verification checkpoint on 2026-07-13:

- The reusable package patch path remains compatible at `@xwlc/* 0.1.1`, with
  Web consuming public exports rather than package internals.
- An isolated disposable Supabase rebuilt the original 16 migrations and the
  final 17-migration chain from empty state. Five rollback-only security suites
  plus full typecheck, lint, test, build, and GitHub CI passed.
- The connected reference/staging/test database runtime schema was exhaustively
  matched before its 11-row ledger was reconciled to the 16 existing repository
  timestamps. This records verified history only; it does not claim old SQL was
  replayed. The mismatched share-token timestamp was reconciled after proving
  equivalent effects.
- PR #82 merged as `4c32d53`. GitHub Actions run `29214674101` then applied the
  reviewed 17th migration from `main` with `target=staging`; cloud history now
  ends at `20260712122026_restrict_public_cat_photo_listing`.
- The public object delivery contract remains intact, while anonymous metadata
  enumeration is removed and owner read/write access is UUID-folder scoped.
  Rollback-only cloud behavior checks passed and left no temporary user or
  Storage rows.
- Key business aggregates did not change, all AI Credit postconditions pass,
  the public-bucket listing Advisor finding is gone, Vercel deployment passed,
  and the stable test URL returned HTTP 200.
- Detailed evidence is in
  `specs/reference-product/package-db-upgrade-verification.md`. GNE-234 remains
  open; this checkpoint must not activate GNE-272.

GNE-272 cross-system evidence checkpoint on 2026-07-13:

- Added `specs/reference-product/evidence-index.md` as the answer-first,
  source-backed handoff for GNE-273. It connects product pages, private access,
  AI/Billing return, Audit/Outbox, PostHog, Supabase, GitHub, Vercel, package,
  migration, and document evidence without treating chat as a source of truth.
- Current cloud facts are indexed without private data: 3 cats, 5 plans, 83
  tasks, 25 submissions, 18 share-token records, 30 test orders, 20
  entitlements, 80 usage rows, 77 Credit rows, 84 Audit rows, and 8 pending
  Outbox rows. All Audit/Outbox rows have correlation IDs; deterministic Audit
  idempotency is explicitly limited to the 8 anonymous-submission effects.
- A representative Creem Test Mode order remains paid for USD 9.00 and links
  to exactly one active 100000-credit entitlement plus one 100000-credit grant.
  CatCare plan-generation and recap usage stays traceable by safe purpose and
  linked Credit rows.
- PostHog project 476986 contains the required CatCare, AI, quota, payment, and
  entitlement events. Across the selected 30-day evidence set, required shared
  property missing counts are zero and selected share events have no missing
  correlation ID. PostHog remains observational rather than a business ledger.
- Current main `16469c5` passed GitHub CI run `29214948129`, Vercel reported a
  successful deployment, and the stable URL returned HTTP 200 from `sin1`.
  Supabase migration parity remains 17/17; staging migration run `29214674101`
  passed.
- GNE-250 final deployment smoke, true production-provider isolation, live
  AI/payment, and real Outbox delivery remain explicitly `not_run` with risk
  and later ownership. The stale AI dashboard “Failure test model” wording is
  recorded as low-risk Analytics metadata debt, not accepted product behavior.
- GNE-272 is evidence-only: no business code, schema, provider configuration,
  real Provider operation, or page capability changed. GNE-234 remains open
  and this checkpoint must not activate GNE-273.

GNE-250 deployed-product smoke checkpoint on 2026-07-13:

- The stable Vercel URL on `main` commit `d7bfeb6` returned HTTP 200 from
  `sin1`; GitHub CI run `29218432852` and the automatic Vercel deployment both
  passed before the product smoke began.
- The deployed owner journey created a GNE-250 cat and reusable routine,
  generated and published a one-day plan, exercised the private-link route and
  one anonymous-token submission, reviewed the real result, and generated a
  mock AI recap. Test entitlement usage moved from 17/65 to 15/65; no real
  charge or live-provider call occurred.
- An independent active-link pass explicitly logged out a synthetic GNE-250
  account before opening the link in a fresh tab. The signed-out page exposed
  only the authorized cat/date/task projection, had no Owner navigation, and
  accepted one idempotent submission; this closes the gap found by Terra's
  first review.
- Trusted Supabase facts confirm the six-task plan, anonymous-token Audit,
  idempotent submission, pending owner-notification Outbox row, two committed
  usage/Credit pairs, and exact 17/17 cloud/repository migration parity.
- Fresh PostHog evidence arrived for cat, routine, plan, publish, share,
  result-open, and both AI actions. A fresh `catcare_submission_created` event
  was not observed, so the result is `pass with non-blocking concerns` and the
  final decision must preserve that observability caveat.
- Detailed evidence is in
  `specs/reference-product/deployed-smoke-verification.md`. GNE-250 changes no
  business code, schema, migrations, provider configuration, or page
  capability. GNE-234 remains open and this checkpoint must not activate
  GNE-273.

GNE-273 v0.3.0 decision checkpoint on 2026-07-13:

- The decision is `Go` for the declared MVP3 scope: Reference Product and
  public-package consumption pass with no blocking defect in the shared
  reference/staging/test environment. This is not a production launch
  approval, and future production gates do not invalidate the completed scope.
- The verified path covers package boundaries, the deployed Owner/private-link
  journey, signed-out anonymous submission, RLS/security negatives,
  AI/Billing/Credit return, Audit/Outbox enqueue, PostHog observation, package
  patch, 17-file empty-database rebuild/cloud parity, GitHub CI, and Vercel.
- At GNE-273 decision time, the fresh `catcare_submission_created` analytics
  event remained absent even though trusted submission/Audit/Outbox/result
  facts passed. The later GNE-266 deployed repair rerun received that event;
  real Outbox delivery, separate production Supabase/PostHog, live AI/payment,
  and Cloudflare/Hono implementation remain explicit trigger-based gates.
- Cloudflare/Hono adapter readiness is `Conditional`: reusable packages are
  runtime-agnostic and expose Actor/Session, owner/scope, safe context, generic
  share-gate, DB-boundary, and provider-port contracts, while actual Worker
  Auth/Email/D1/KV/Queues adapters and non-RLS acceptance are not implemented.
- The next product may proceed to GNE-274 for the separate product-expansion
  judgment. GNE-273 changes no business code, schema,
  migration, provider configuration, or page capability; it does not close
  GNE-234 or activate GNE-274.
- Detailed evidence is in `specs/reference-product/v0.3.0-decision.md`.

GNE-266 Analytics reliable-delivery repair checkpoint on 2026-07-13:

- GNE-266 and parent GNE-233 were reopened after final smoke found a trusted
  anonymous submission/Audit/Outbox/result fact without a matching fresh
  `catcare_submission_created` PostHog event.
- Root cause is the CatCare server services returning after unmanaged
  `void trackCatCareProductEvent(...)` calls. Vercel could end the request
  lifecycle before the nested PostHog fetch completed.
- All current CatCare server product-event calls now await the product
  Analytics facade. The shared server transport bounds capture at 1 second
  and safely settles Provider exceptions, HTTP failures, and timeouts without
  reversing committed business facts.
- The existing synchronous safe-context fan-out and Audit behavior remain
  unchanged. The first implementation accidentally coupled Audit rejection to
  an already committed publish result; Terra identified this P2 and the final
  implementation removed that regression.
- Web tests pass `80/80`, including Provider failure, HTTP failure, actual
  AbortSignal timeout, preserved business success, and a structural guard
  against CatCare fire-and-forget Analytics. Full test, typecheck, lint,
  production build, package/release boundaries, and diff checks pass.
- Independent Terra targeted re-review is `READY` with no remaining P0-P3.
- PR #89 passed GitHub CI and merged as
  `82e918794350c53a8bc9a828050420f42e74c86b`. Vercel automatic deployment
  completed successfully at 2026-07-13 04:45:34 UTC.
- Fresh deployed plan `8e84b9b1-7d82-4b20-b2f5-8c056b137a66` produced an
  authorized anonymous view and one completed submission. The anonymous page
  changed from `0/6` to `1/6`, and the Owner result page showed the same real
  completion.
- PostHog project 476986 received `catcare_share_page_viewed` and
  `catcare_submission_created`. The submission event, anonymous-token Audit,
  and pending Owner-notification Outbox row shared correlation ID
  `1aa1180a-7a0f-43ab-934d-975d586c5909`; Analytics stored only the redacted
  `/s/[redacted]` URL and no raw token or private note.
- The GNE-266 reliable-delivery defect is closed by deployed evidence. Parent
  GNE-233 may return to Done after its child/status audit; this execution must
  stop before activating GNE-274.

GNE-273 final evidence amendment checkpoint on 2026-07-13:

- The v0.3.0 decision remains `Go for the declared MVP3 scope`; the amendment
  does not broaden it into production approval or change the Cloudflare/Hono
  `Conditional` judgment.
- The formal decision and evidence index now accept GNE-266 PR #89 runtime
  commit `82e9187` and PR #90 evidence/main commit `55553d3`. Main CI run
  `29225628666` and the Vercel commit status both passed for `55553d3`.
- The original GNE-250 missing `catcare_submission_created` observation is
  retained as historical evidence, while the GNE-266 deployed rerun is the
  superseding result. It is no longer a GNE-274 caveat.
- This amendment is documentation-only. It changes no business code, page,
  schema, migration, Provider configuration, live Provider, payment, or
  production data operation, and it does not activate GNE-274.

## Next Steps

1. Publish the final GNE-273 evidence amendment, then close only GNE-273 after
   CI, merge, automatic deployment, and Linear evidence sync pass.
2. Keep GNE-274 in Backlog and do not activate it in this execution.
3. Keep GNE-234 open. Run GNE-274 in a separate later root task to decide the
   Travel/product-expansion path.
4. Keep `v0.2.0` as the sealed MVP2 baseline and use
   `specs/reference-product/v0.3.0-decision.md` as the MVP3 decision record.
5. Treat the current cloud Supabase/PostHog resources as
   reference/staging/test. Separate production providers, live AI/payment,
   real Outbox delivery, and Cloudflare/Hono implementation remain
   trigger-based future gates.
6. Keep product-specific objects outside `@xwlc/*`, preserve public-package
   imports and the one-parent/one-child WIP rule, and map future production
   gates to then-current Issues only when their trigger occurs.
7. Future deployment, monitoring, smoke, environment, schema, or Provider work
   must follow the repository specs and update durable evidence rather than
   relying on chat history.

## Risks

- External providers beyond Supabase/PostHog are documented or sandbox/mock/no-op only; real Payment and AI providers are not configured.
- No secrets should be added to the repository.
- Local machine exposes `pnpm@9.15.0`.
- Local Supabase runs through Colima; analytics is disabled locally because the Supabase vector container cannot mount Colima's Docker socket path.
- Staging performance advisors currently include only expected unused-index INFO entries until `demo_items` receives representative query traffic.
- Future deployments still need Supabase and PostHog environment variables configured per environment before full Auth smoke tests can pass there.
- Current live Production was observed before this region change with Vercel Functions in `iad1` while Supabase is in `ap-southeast-1`; after merge and redeploy, verify the deployment reports `sin1` and rerun the login-to-Dashboard latency check before claiming a performance improvement.
- Automatic Vercel Preview deployments are intentionally disabled for non-`main` branches while the project stays on a Hobby/private-repo collaboration setup.
- Production deployments from `main` may still be subject to Vercel Hobby commit-author checks after merging contributor-authored commits, especially if a collaborator PR is merged with `Squash and merge`.
- GitHub branch protection may remain unenforced on the current free personal private repository, so the documented branch and PR workflow is still a required team convention.
- Payment sandbox result URLs are intentionally navigation-only; reviewers must not treat them as proof of paid entitlement or credit grant.
