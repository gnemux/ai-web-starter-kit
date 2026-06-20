# Project Status

## Phase

Initialization.

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
- `GNE-106` DEPLOY-01
- `GNE-107` DEPLOY-02
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

## In Progress Issues

None.

## In Progress

No active implementation task is currently recorded in this context file.

## Next Steps

1. Before implementing MVP2 provider-dependent work, start from `GNE-180` and define the provider matrix, env naming, mock/no-op/sandbox strategy, and config checklist.
2. Start MVP3 from `GNE-173` by writing Product Validation Kit specs before implementing new data or app flows.
3. Keep `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, AI provider keys, payment secrets, webhook secrets, email keys, storage secrets, and SMS keys out of browser code and `NEXT_PUBLIC_` variables.
4. Add generated Supabase database types in a later API/Auth hardening pass if the schema grows.
5. Keep all new route-level UI copy in the shared i18n dictionary with Chinese and English entries.

## Risks

- External providers are documented but not configured.
- No secrets should be added to the repository.
- Local machine exposes `pnpm@9.15.0`.
- Local Supabase runs through Colima; analytics is disabled locally because the Supabase vector container cannot mount Colima's Docker socket path.
- Staging performance advisors currently include only expected unused-index INFO entries until `demo_items` receives representative query traffic.
- Future deployments still need Supabase and PostHog environment variables configured per environment before Auth smoke tests can pass there.
