# Project Status

## Phase

MVP1 foundation complete; the MVP2 integrations provider foundation is complete in repository docs and Linear child issues.

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
- Simplified authenticated app shell navigation so work area pages use one primary nav with Dashboard and Account only, while the top header is reserved for account actions.
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
- Split Integrations stage boundaries in docs: `GNE-167` is MVP2 provider matrix/env/adapter foundation, and `GNE-193` is the MVP4 overseas/china real provider rollout parent.
- Updated MVP3 Product Validation Kit planning so sandbox/mock/no-op Payment and AI remain the core path, while real Payment and real AI provider product acceptance are conditionally tracked through `GNE-194` and `GNE-195`.
- Clarified Analytics stage status: `ANALYTICS-01..04` are MVP1 Done, while `ANALYTICS-05..11` cover MVP2/MVP3 production verification, dashboards, multi-env isolation, Payment conversion, and AI analytics.
- Recorded PostHog production event evidence for `GNE-105`: PostHog Activity shows production Vercel URL events including `Pageview`, `Identify`, `login_started`, and `user_logged_in`.
- Updated public app branding defaults so metadata, favicon, `.env.example`, analytics default app name, and environment matrix use `XWLC` instead of the old `ai-web-starter-kit` display name.
- Documented the Vercel Hobby / private repo merge-method rule: non-owner collaborator PRs should use `Create a merge commit` by default so the `main` deployment-triggering commit is owner-authored; already-reviewed blocked squash merges may be followed by an owner-authored no-op trigger commit.
- Completed `GNE-180` by adding the MVP2 provider matrix, integrations spec entry, and placeholder integration docs for Email, Storage, and SMS.
- Completed `GNE-181` by adding provider-neutral contracts in `packages/core`, app-side provider descriptors, and server-only sandbox/mock/no-op adapter landing points.
- Completed `GNE-182` by standardizing provider selectors, public/server-only env naming, `.env.example` placeholders, environment matrix guidance, and related integration docs.
- Completed `GNE-183` by adding the reusable provider configuration, no-op/mock/sandbox behavior, smoke path, and secret leakage checklist.
- Completed `GNE-167` as the MVP2 integrations provider foundation: matrix, adapter/interface landing points, env/public-secret rules, and reusable verification checklist are all reachable from repository entry points.
- Completed the MVP2 Billing foundation for `GNE-71`: Billing specs, internal integration notes, provider-agnostic core pricing/entitlement contracts, app Billing service boundary, a human-readable `/account` Billing review surface, and a verified Supabase migration for orders, subscriptions, entitlements, credit ledger, and usage ledger.
- Synced the non-black-box reviewer rule for commercial and AI execution: Payment, AI, and MVP3 Product Validation Kit issues now require page-level human acceptance paths in addition to service, database, and provider contracts.
- Added explicit APP/REVIEW Linear tasks so page-level acceptance cannot be missed during child-issue execution: `GNE-197` for Billing Done, `GNE-198` for Payment, and `GNE-199` for AI.
- Completed `GNE-105 ANALYTICS-06`: production PostHog Activity now shows the deployed Vercel URL with the required shared properties, including the corrected `env=production`.

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

## In Progress Issues

- `GNE-73` MVP1-MVP3 ANALYTICS-00

## In Progress

MVP2 Billing foundation work is complete locally on branch `codex/mvp2-billing-foundation`. TypeScript, lint, production build, and local Supabase reset pass for the current Billing draft.

## Next Steps

1. For `GNE-105 ANALYTICS-06`, expand one production PostHog event and confirm `app`, `mvp_stage`, `market`, `env`, `version`, and `module`; then mark the issue Done in Linear if the fields are present.
2. Continue MVP2 Payment from `GNE-192`, `GNE-96`, `GNE-97`, and `GNE-98`; then execute `GNE-198 PAYMENT-08` so the reviewer path from pricing/billing entry to checkout, result pages, and order/subscription/entitlement status exists before real provider validation.
3. Prepare a PR for `codex/mvp2-billing-foundation` before any staging Supabase migration.
4. Continue MVP2 AI from `GNE-149`, `GNE-156`, `GNE-150`, `GNE-151`, `GNE-152`, `GNE-153`, and `GNE-154`; then execute `GNE-199 AI-10` so the reviewer path for input, entitlement gate, provider mode, result, usage/credit/quota, and failure states exists before final AI test/deploy closure.
5. Start MVP3 from `GNE-173` by writing Product Validation Kit specs before implementing new data or app flows; the MVP3 parent checklist must keep the full clickable chain visible from auth through project, public page, lead, Free/Pro gating, sandbox checkout, AI generation, and PostHog funnel evidence.
6. Treat `GNE-194` and `GNE-195` as conditional MVP3 follow-ups only after MVP2 real Payment / AI provider readiness exists.
7. Keep `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, AI provider keys, payment secrets, webhook secrets, email keys, storage secrets, and SMS keys out of browser code and `NEXT_PUBLIC_` variables.
8. Regenerate Supabase database types from the verified schema in a later hardening pass if the Billing schema changes further.
9. Keep all new route-level UI copy in the shared i18n dictionary with Chinese and English entries.
10. If shared PR preview URLs become required for every collaborator branch, upgrade Vercel collaboration or have the Vercel project owner run manual Preview deployments.
11. For collaborator-authored PRs while Vercel remains on Hobby/private-repo constraints, the Repo Owner should use `Create a merge commit`; use `Squash and merge` only after confirming the resulting deployment commit author will pass Vercel checks.
12. Future AI-assisted tasks should follow `specs/collaboration/engineering-spec.md` before making edits.
13. Future deployment, monitoring, smoke test, or environment-matrix tasks should follow `specs/deploy/engineering-spec.md` and update the relevant memory document instead of relying on chat history.
MVP2/MVP3 planning is being synchronized with Linear. MVP1 base Analytics (`ANALYTICS-01..04`) is Done, and `ANALYTICS-06` production PostHog event/field verification is Done.
14. Continue MVP2 Billing with `GNE-91` and `GNE-191` before implementing entitlement service, Payment, or AI credit logic.
15. . Continue MVP2 Payment from `GNE-192` and `GNE-96`, using the provider matrix and config checklist before adding any real checkout provider.
16. Continue MVP2 AI from `GNE-149`, `GNE-156`, and `GNE-150`, using the provider matrix and config checklist before adding any real model provider.
17. Start MVP3 from `GNE-173` by writing Product Validation Kit specs before implementing new data or app flows.
18. Treat `GNE-194` and `GNE-195` as conditional MVP3 follow-ups only after MVP2 real Payment / AI provider readiness exists.
19. Keep `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, AI provider keys, payment secrets, webhook secrets, email keys, storage secrets, and SMS keys out of browser code and `NEXT_PUBLIC_` variables.
20. Add generated Supabase database types in a later API/Auth hardening pass if the schema grows.
21. Keep all new route-level UI copy in the shared i18n dictionary with Chinese and English entries.
22. If shared PR preview URLs become required for every collaborator branch, upgrade Vercel collaboration or have the Vercel project owner run manual Preview deployments.
23. For collaborator-authored PRs while Vercel remains on Hobby/private-repo constraints, the Repo Owner should use `Create a merge commit`; use `Squash and merge` only after confirming the resulting deployment commit author will pass Vercel checks.
24. Future AI-assisted tasks should follow `specs/collaboration/engineering-spec.md` before making edits.
25. Future deployment, monitoring, smoke test, or environment-matrix tasks should follow `specs/deploy/engineering-spec.md` and update the relevant memory document instead of relying on chat history.

## Risks

- External providers beyond Supabase/PostHog are documented or planned but not configured.
- No secrets should be added to the repository.
- Local machine exposes `pnpm@9.15.0`.
- Local Supabase runs through Colima; analytics is disabled locally because the Supabase vector container cannot mount Colima's Docker socket path.
- Staging performance advisors currently include only expected unused-index INFO entries until `demo_items` receives representative query traffic.
- Future deployments still need Supabase and PostHog environment variables configured per environment before full Auth smoke tests can pass there.
- Automatic Vercel Preview deployments are intentionally disabled for non-`main` branches while the project stays on a Hobby/private-repo collaboration setup.
- Production deployments from `main` may still be subject to Vercel Hobby commit-author checks after merging contributor-authored commits, especially if a collaborator PR is merged with `Squash and merge`.
- GitHub branch protection may remain unenforced on the current free personal private repository, so the documented branch and PR workflow is still a required team convention.
