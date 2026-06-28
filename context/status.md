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
- Applied M2 DATA migrations to Supabase staging project `nglilxhkuqzswbwitbdu`.
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
- Created MVP3 child issues under their corresponding parent issues. PLAN pure-document child issues were later collapsed back into `GNE-228` after the milestone and parent issue absorbed their content; active execution children now start from `GNE-240` under PLATFORM and continue through `GNE-274` under VERIFY. Child issues intentionally have no Linear labels and should remain `No milestone`; `GNE-250 DELIVERY-06`, `GNE-267 CAP-07`, and `GNE-274 VERIFY-07` were added to cover real deployment reproduction, failure/retry/idempotency/degradation, and product expansion decision gaps.
- Retired the old MVP3 Product Validation Kit route from current planning: its parent/CP line was canceled or manually removed from Linear, is no longer an execution source, and should not be moved into MVP4-MVP6. `GNE-75` is now treated as `FUTURE GROWTH-00`, a horizontal Growth backlog parent outside the MVP3 Reference Product route.
- Strengthened the MVP3 Reference Product Linear milestone and execution issues for newcomer/reviewer readability: the milestone now includes dual-foundation, business-loop, data-flow, and reviewer-verification Mermaid diagrams; all seven parent issues now explain purpose, best-practice rationale, boundaries, code-architecture role, reusable-platform value, product value, reviewer actions, and verification method. Key child issues now include execution templates for glossary/diagrams, package boundaries, delivery evidence, product data model, share-token lifecycle, capability mapping, and the 30-minute Reviewer Runbook.
- Applied the follow-up MVP3 execution-quality review: the milestone now includes the final 5 questions, a code-directory mapping table, and a minimum child-issue construction template. `GNE-251` now carries the product ERD, minimum fields, RLS ownership, file-range hints, and non-goals; `GNE-259` carries the owner/anonymous permission matrix; page-flow child issues `GNE-252`, `GNE-253`, `GNE-257`, and `GNE-258` carry page-level Done criteria; `GNE-273` now has the v0.3.0 conclusion template; `GNE-274` now has the product-expansion decision checklist. The review suggestion to mechanically expand all 39 child issues was intentionally not applied; remaining child issues should be brought up to the minimum template when their parent enters active execution. A standalone MVP3 evidence document is deferred until real verification evidence exists.
- Applied the second MVP3 execution-risk review with scope control: accepted the need to harden thin child issues and parent sequencing, but did not duplicate the milestone/GNE-230/GNE-232 diagrams that already cover data flow, delivery flow, and token flow. `GNE-247`, `GNE-243`, `GNE-263`, `GNE-264`, `GNE-265`, `GNE-267`, and `GNE-251` were expanded with migration/schema rules, machine-checkable package boundaries, Outbox/AI/Billing/Fallback/idempotency details, and a unified Reference Product state model. The parent chain was reinforced as `GNE-228 -> GNE-229 -> GNE-230 -> GNE-231 -> GNE-232 -> GNE-233 -> GNE-234`; no Linear labels or extra issues were added.
- Clarified overlapping MVP3 child-issue boundaries: `GNE-248` owns version evidence mechanisms while `GNE-272` owns final evidence aggregation; `GNE-249` owns recovery principles while `GNE-273` owns the final v0.3.0 conclusion; `GNE-255` owns Product page analytics while `GNE-266` owns cross-capability PostHog correlation; `GNE-260` owns Access-stage security rules/audit while `GNE-270` owns final security negative verification.
- Updated the Linear project status update for `Web 端的可商用模板`: the previous latest update was still `MVP1 完成，MVP2 开始` from 2026-06-21, so a new 2026-06-26 update now records MVP2 at 100%, the retired legacy MVP3 route, the current MVP3 Reference Product route, the seven parent issue sequence, and the next step to begin from `GNE-228`.

## Verification Snapshot

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

## In Progress Issues

- `GNE-229` MVP3-02 PLATFORM [ARCH] 基座 Package 化与产品消费
- `GNE-240` MVP3 PLATFORM-01 [ARCH] Package 边界与依赖方向

## In Progress

MVP2 foundation parents are complete locally and in Linear: Integrations, Billing, Payment, AI, and Analytics. GitHub tag `v0.2.0` is the MVP2 sealed baseline. `GNE-228` PLAN is Done. MVP3 is now in `GNE-229` PLATFORM, starting with `GNE-240` package boundary and dependency direction. Current repo packages remain `@starter/core` and `@starter/ui`; `@xwlc/core`, `@xwlc/ui`, `@xwlc/platform`, and `@xwlc/db` are the MVP3 target convention. GNE-240 records the boundary only; package renaming, new public exports, product consumption, boundary checks, and patch evidence belong to later PLATFORM child issues. Production payment remains deferred to `GNE-201`. Real-provider AI production smoke remains `not_run` until provider configuration and redeploy.

## Next Steps

1. Keep `v0.2.0` as the MVP2 baseline. For MVP3 implementation, pull latest `main` from GitHub and create a fresh task branch; do not reuse the pre-tag Auth/payment branches.
2. Treat the current cloud Supabase project as reference/staging/test for MVP3 validation. Production Supabase is not enabled during MVP3; if a template asks for Production evidence, record `not_run / not enabled in MVP3`.
3. Before any future online release or production gate, apply repository Supabase migrations through the reviewed workflow; do not rely on dashboard-only schema edits.
4. Configure Supabase Auth URL settings for the deployed validation domain that is actually used; production Auth URL settings become a separate gate only when a true production Supabase project exists.
5. Configure Vercel env entries from `.env.example` and `context/environment-matrix.md`, keeping server-only Supabase, Payment, AI, Email, Storage, and SMS secrets out of `NEXT_PUBLIC_`; redeploy after any env change before using the deployment as evidence.
6. Start MVP3 from `GNE-228 MVP3-01 PLAN`, then follow `GNE-229` through `GNE-234`. The route validates a Reference Product consuming platform packages; it does not continue the old Product Validation Kit CP chain.
7. Keep MVP3 on the 小团队 WIP rule: one parent issue carries the main implementation at a time; child issues stay under their parent issue and should not be assigned to the MVP3 milestone view or given Linear labels. Use the milestone diagrams and parent issue sections as the starting point for newcomer onboarding and reviewer acceptance.
8. During `GNE-228`, keep the confirmed PLAN decisions visible: Linear + repo evidence sync, short task branches from `main`, single monorepo with package boundaries, current Supabase as reference/staging/test only, Supabase + Vercel mainline, Cloudflare/Hono adapter-readiness only, and AI/Billing mock/no-op/sandbox/test only.
9. Treat the PLAN gate as failed if product-specific cat-care objects enter platform packages, if work starts from old pre-`v0.2.0` branches, if child issues are executed out of sequence without an explicit decision, if production Supabase/live payment/real AI become MVP3 blockers, if private tokens/private content appear in evidence, or if the final Reviewer path cannot connect page/data/RLS/deploy/analytics/CI/version evidence.
10. In `GNE-229`, keep MVP3 package naming to `@xwlc/core`, `@xwlc/ui`, `@xwlc/platform`, and `@xwlc/db`. Product-specific cat-care objects must stay outside platform packages.
11. In `GNE-230`, require the minimum delivery gate: product repo can install packages, CI runs, Supabase reference/staging migrations run, Vercel validation deploys, version evidence is visible, and smoke tests pass. Use forward fix / expand-contract for database changes instead of promising DB rollback.
12. In `GNE-232`, verify private-link lifecycle and risks: creation, use, expiry, revocation, repeated access, repeated submit, forwarded links, guessed tokens, raw-token log leakage, and anonymous abuse prevention.
13. In `GNE-233`, keep the internal order Audit / Correlation ID -> Outbox -> AI draft with human review -> Entitlement / Usage -> Sandbox / Test Mode -> Health / Trace / Metrics. Do not let AI or Payment work block the PRODUCT or ACCESS minimum path.
14. In `GNE-234`, execute the 30-minute Reviewer Runbook, then produce the final v0.3.0 decision: whether the package-consumption approach is valid, which capabilities enter XWLC v0.3.0, which need rework, and whether the next real product can start from v0.3.0.
15. Before activating each MVP3 child issue, check whether it satisfies the milestone's minimum child-issue construction template: target, rationale, possible file/directories, outputs, non-goals, reviewer verification, documentation sync, and not_run/risk records.
16. Use `GNE-201` for any production payment, live payment, merchant settlement, refund, reconciliation, invoice, or real user payment planning.
17. Treat `GNE-75 FUTURE GROWTH-00` as a future/backlog horizontal growth parent. Do not attach it to MVP3 Reference Product, MVP4, MVP5, or MVP6 unless a later product-growth decision explicitly reopens that scope.
18. Keep all new route-level UI copy in the shared i18n dictionary with Chinese and English entries.
19. Future AI-assisted tasks should follow `specs/collaboration/engineering-spec.md`; future deployment, monitoring, smoke test, or environment-matrix tasks should follow `specs/deploy/engineering-spec.md` and update the relevant memory document instead of relying on chat history.

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
