# Project Status

## Phase

MVP1 foundation complete; the MVP2 integrations provider foundation, MVP2 Billing foundation, and MVP2 AI foundation are complete locally. MVP2 Payment sandbox foundation is implemented locally and is under reviewer hardening before PR. Real-provider AI production smoke remains `not_run` until a provider is configured and deployed.

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
- Synced Linear planning to the `GNE-172` MVP factory route: added MVP1/MVP2/MVP3 prefixes to module parent issues, updated `GNE-168` with the stage mapping, promoted `GNE-171` to the MVP3 Product Validation Kit entry, and created `GNE-173` through `GNE-179` as MVP3 CP execution tasks.
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
- Updated MVP3 Product Validation Kit planning so sandbox/mock/no-op Payment and AI remain the core path. Payment provider validation is test-mode only through `GNE-194`; live payment is deferred to the MVP5 production-payment gate.
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
- Synced the non-black-box reviewer rule for commercial and AI execution: Payment, AI, and MVP3 Product Validation Kit issues now require page-level human acceptance paths in addition to service, database, and provider contracts.
- Added explicit APP/REVIEW Linear tasks so page-level acceptance cannot be missed during child-issue execution: `GNE-197` for Billing Done, `GNE-198` for Payment, and `GNE-199` for AI.
- Completed `GNE-105 ANALYTICS-06`: production PostHog Activity now shows the deployed Vercel URL with the required shared properties, including the corrected `env=production`.
- Completed the MVP2 Payment sandbox foundation in the repository for `GNE-192`, `GNE-96`, `GNE-97`, `GNE-98`, and `GNE-198`: Payment specs, sandbox provider checkout sessions, protected `/account/payment` review surface, sandbox success/cancel/failure result pages, protected sandbox server action that writes trusted Billing facts, no-side-effect sandbox webhook acknowledgement, and an Account usage-gate reviewer entry that simulates AI usage before prompting upgrade or credit-pack payment.
- Synced the Linear Payment route cleanup into project docs: `GNE-72` is now the MVP2 Payment foundation and real Provider validation boundary; `PAYMENT-01..06` plus `PAYMENT-04R` are the mainline, while `PAYMENT-07/08` are optional Provider research/test-mode spike work; `GNE-158` moved to `MVP3-CP-09`; `GNE-201` owns future production payment readiness.
- Advanced MVP2 Payment analytics and env safety: `GNE-104` now emits server-side `checkout_started`, `payment_succeeded`, `payment_failed`, `payment_canceled`, `entitlement_granted`, and `quota_limit_reached` from trusted Payment/Billing service boundaries. `GNE-202` is complete in repo with `.env.example` and provider docs covering `PAYMENT_MODE`, `PAYMENT_LIVE_ENABLED`, `PAYMENT_PROVIDER_SECRET`, server-only secrets, and the MVP5 live-payment gate.
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
- `GNE-105` ANALYTICS-06
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

## In Progress Issues

- `GNE-73` MVP1-MVP3 ANALYTICS-00
- `GNE-72` MVP2 PAYMENT-00

## In Progress

MVP2 Payment sandbox foundation is implemented locally and is under reviewer hardening before PR. TypeScript, lint, production build, protected-route smoke, and sandbox webhook smoke have passed locally for the foundation. Paid-plan sandbox success writes trusted Billing subscription facts through a protected server action; AI credit-pack sandbox success writes credit-pack entitlement and ledger facts. The workspace menu now exposes profile settings, Plans, and AI as first-level entries: `/account` is profile settings, `/account/billing` shows a product-like Free/Plus/Pro plan selection with recent plan records, and `/account/usage` contains a product-facing AI Credit account with available Credit, plan-vs-credit-pack source split, credit-pack top-up, top-up records, and Credit consumption records. AI usage writes `billing_usage_ledger`, reduces remaining Credit in Billing snapshots, and only triggers next-plan or credit-pack payment when the backend entitlement decision blocks usage. Payment analytics (`GNE-104`) emits checkout, success, failure, cancel, entitlement-granted, and quota-limit events from trusted service boundaries. Payment env/security documentation (`GNE-202`) is complete in repo. MVP2 AI parent `GNE-148` is complete locally: the AI boundary docs now define Credit-first UI, provider token measurement as an internal fact, server-only AI service ownership, workspace placement for sample AI workflows, and Billing/Payment/Analytics responsibilities; the runtime now exposes a server-only AI text service, controlled API route, server-only model catalog, mock/no-op provider factories, provider-neutral adapter shapes, workspace AI draft example, successful mock usage/Credit ledger commit path, selected-model access gate, page-level app review path, repeatable safety verification, duplicate idempotency protection, safe server-side AI analytics summary events, and a server-side `AI_BUDGET_LIMIT` operator cap for deploy readiness. Real Provider work is represented by optional `GNE-99` research and `GNE-100` test-mode spike only; production payment is deferred to `GNE-201`; real-provider AI production smoke remains `not_run` until provider configuration and redeploy.

## Next Steps

1. Human reviewer should sign in locally, review `/account/billing` for the product-like Free/Plus/Pro plan selection and recent plan records, open `/account/usage` for available Credit, plan-vs-credit-pack source split, credit-pack top-up, top-up records, and Credit consumption records, run Plus/Pro monthly and AI credit-pack sandbox checkout from the prompted actions, and verify success changes the current plan or grants credits through server-side Billing facts while cancel/failure do not upgrade or grant credits.
2. Open a PR from the task branch into `main` only after the local page-level checklist is accepted; Repo Owner should review and merge with the documented Vercel Hobby/private-repo merge method.
3. Ask a human reviewer to verify local or deployed PostHog Activity for the implemented Payment events if `NEXT_PUBLIC_POSTHOG_KEY` is configured; record evidence without secrets.
5. `GNE-99` has produced `Go test mode` for Creem based on test mode, Pro product, API/Webhook dashboard, and official test checkout evidence. `GNE-100` is now In Progress as a Creem test-mode PaymentProvider adapter spike, not as a production payment integration. `PAYMENT_PROVIDER=creem` selects the Creem adapter locally, while `PAYMENT_PROVIDER=sandbox` still selects SandboxProvider. The adapter and `pnpm payment:creem:test-checkout` safely stop before sending a request when the server-only Creem test key is missing; next progress requires a human-created Creem test API key in ignored local env. Keep `PAYMENT_MODE=test`, `PAYMENT_LIVE_ENABLED=false`, and send production payment planning to `GNE-201`.
6. Continue `GNE-158 MVP3-CP-09` only inside MVP3 Product Validation Kit, using SandboxProvider for AI credit pack and subscription allowance validation.
7. MVP2 AI parent `GNE-148` is complete locally. Keep real-provider AI acceptance under future provider tasks and do not mark production AI smoke as passed until a deployed real-provider path is verified.
8. Start MVP3 from `GNE-173` by writing Product Validation Kit specs before implementing new data or app flows; the MVP3 parent checklist must keep the full clickable chain visible from auth through project, public page, lead, Free/Plus/Pro gating, sandbox checkout, AI generation, and PostHog funnel evidence.
9. Treat `GNE-194` as test-mode-only Payment adapter validation with live payment disabled, and treat `GNE-195` as conditional AI provider acceptance.
10. Use `GNE-201` for any production payment, live payment, merchant settlement, refund, reconciliation, invoice, or real user payment planning.
11. Keep `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, AI provider keys, payment secrets, webhook secrets, email keys, storage secrets, and SMS keys out of browser code and `NEXT_PUBLIC_` variables.
12. Keep all new route-level UI copy in the shared i18n dictionary with Chinese and English entries.
13. Future AI-assisted tasks should follow `specs/collaboration/engineering-spec.md` before making edits.
14. Future deployment, monitoring, smoke test, or environment-matrix tasks should follow `specs/deploy/engineering-spec.md` and update the relevant memory document instead of relying on chat history.

## Risks

- External providers beyond Supabase/PostHog are documented or sandbox/mock/no-op only; real Payment and AI providers are not configured.
- No secrets should be added to the repository.
- Local machine exposes `pnpm@9.15.0`.
- Local Supabase runs through Colima; analytics is disabled locally because the Supabase vector container cannot mount Colima's Docker socket path.
- Staging performance advisors currently include only expected unused-index INFO entries until `demo_items` receives representative query traffic.
- Future deployments still need Supabase and PostHog environment variables configured per environment before full Auth smoke tests can pass there.
- Automatic Vercel Preview deployments are intentionally disabled for non-`main` branches while the project stays on a Hobby/private-repo collaboration setup.
- Production deployments from `main` may still be subject to Vercel Hobby commit-author checks after merging contributor-authored commits, especially if a collaborator PR is merged with `Squash and merge`.
- GitHub branch protection may remain unenforced on the current free personal private repository, so the documented branch and PR workflow is still a required team convention.
- Payment sandbox result URLs are intentionally navigation-only; reviewers must not treat them as proof of paid entitlement or credit grant.
