# Test Plan: MVP3 Reference Product

## Unit Tests

- `pnpm test:package-boundaries`
  - Confirms package public-entry usage and product-object boundary rules.

## Integration Tests

- `supabase db reset`
  - Confirms all migrations rebuild the local database.
- Local RLS query
  - Confirms `cats`, `care_routines`, `care_routine_items`, `care_items`,
    `care_events`, `care_plans`, `care_tasks`, and `care_submissions` exist,
    have RLS enabled, and have owner policies.
  - GNE-254 adds `supabase/tests/catcare_owner_rls.sql` as the
    rollback-only acceptance script. It creates local-only owner A/B rows,
    verifies owner A can read only A-owned CatCare rows, verifies cross-owner
    inserts are rejected or update zero rows, and verifies `anon` cannot read or
    write owner-only CatCare tables.
- Remote linked Supabase query
  - Confirms the same 8 PRODUCT02 tables, RLS flags, owner policy counts,
    grants, and migration-history version in the shared test project.
  - GNE-254 runs the same rollback-only SQL through
    `supabase db query --linked --file supabase/tests/catcare_owner_rls.sql`
    so the linked test database can prove owner A/B isolation without
    persisting seed rows.

## Browser / E2E Checks

- Path: `/catcare` while signed out.
  - Expected result: redirects to `/login?next=/catcare`.
- Path: `/reference-product` and `/reference-product/plans/demo/results`.
  - Expected result: redirects to the matching `/catcare` route as a legacy
    compatibility shim.
- Path: `/`.
  - Expected result: CatCare product homepage is the first screen, with primary CTA to CatCare signup/workspace and secondary CTA to the CatCare flow section.
- Path: `/login?next=/catcare`.
  - Expected result: CatCare login/signup context renders and keeps the requested return path.
- Path: `/account/billing` and `/account/usage`.
  - Expected result: product reviewers can reach plan/payment and AI Credit
    surfaces from the CatCare shell; full product-specific paywall wiring still
    belongs to CAPABILITY. Their app nav and account menu must not expose
    `/dashboard` inside the CatCare flow.
- Path: `/demo`.
  - Expected result: foundation demo entry renders and points to `/dashboard` or `/demo/login?next=/dashboard`.
- Path: `/demo/login?next=/dashboard`.
  - Expected result: foundation demo login/signup context renders, reuses AuthForm, and keeps the requested demo return path.
- Path: `/dashboard` while signed out.
  - Expected result: redirects to `/demo/login?next=/dashboard`.
- Path: `/demo/account`, `/demo/account/billing`, and `/demo/account/usage` while signed out.
  - Expected result: redirect to `/demo/login` with the original demo return path preserved.
- Path: Demo account menu while signed in.
  - Expected result: profile, billing/order records, and usage stay under `/demo/account*`; the Demo menu does not link to `/catcare`.
- Path: `/catcare` while signed in.
  - Expected result: page renders owner product UI, empty state, cat form, plan form, plan list, and account/billing/usage entries.
- Path: `/s/[token]` while signed out.
  - Expected result: valid share token renders the anonymous sitter read-only
    page with minimum care-plan fields and task list only.
  - Expired, revoked, invalid, and unavailable links render explicit empty/error
    states and do not show care tasks.
  - The page must not render owner navigation, billing/payment/AI controls,
    owner email, owner/internal ids, raw share token, token hash, debug
    information, or submission UI.
  - Mobile QA must cover 375px and 390px viewports with no horizontal overflow
    and product-grade spacing, typography, status chips, and CTA hierarchy.
- Path: `/catcare/cats`, `/catcare/routines`,
  `/catcare/items`, `/catcare/events`,
  `/catcare/plans`, and `/catcare/plans/[id]/results`
  while signed out.
  - Expected result: redirects to `/login` with the original CatCare return
    path preserved.
- Path: create cat, create plan, publish plan.
  - Expected result: plan appears in the list and changes from draft to published.
- GNE-255 analytics QA matrix:
  - Landing and `/login?next=/catcare` render CatCare context; auth events stay
    in the existing auth analytics module.
  - Signed-in owner shell pages `/catcare`, `/catcare/cats`,
    `/catcare/routines`, `/catcare/items`, `/catcare/events`,
    `/catcare/plans`, `/catcare/results`, `/account/billing`, and
    `/account/usage` emit CatCare page-level events with shared
    `app/env/module/version` properties and normalized `page_key`; raw ids,
    notes, titles, emails, and tokens must not be sent.
  - CatCare shell navigation emits `catcare_navigation_clicked` with
    normalized source and target page keys.
  - Owner plan actions emit non-sensitive events:
    `catcare_plan_created`, `catcare_plan_tasks_updated`,
    `catcare_plan_published`, `catcare_plan_closed`, and
    `catcare_plan_deleted`.
  - Existing owner cat/routine events remain in scope:
    `catcare_cat_created`, `catcare_cat_updated`, `catcare_cat_deleted`,
    `catcare_routine_started`, `catcare_routine_copied`, and
    `catcare_routine_saved`.

## Manual Verification

- Review `specs/reference-product/gne-278-product-flow.md` before changing
  PRODUCT implementation. It is the current page-map and prototype gate.
- Compare implementation pages against
  `specs/reference-product/prototypes/v6-regenerated-normalized/` for
  the current bilingual interaction flow, while treating text and numbers as
  non-binding placeholders.
- Review mobile and desktop layouts for text overflow.
- Check that `/account`, `/account/billing`, and `/account/usage` remain separate shared account surfaces for now.
- Check that CatCare navigation does not link to `/dashboard`, and Demo navigation does not link to `/catcare` or CatCare account pages.
- Check that page copy does not imply anonymous access, AI Credit consumption, or product billing are complete in GNE-231.
- Check that paid status appears in value-consuming product surfaces, not only
  Billing, and never appears on the anonymous sitter page.
- Check that the first-run path can generate a temporary checklist from cat
  profile, routine, and scenario without requiring food/care items or event
  history.
- Check that daily event and food/treat/care item capture is represented as
  optional AI-quality and retention input before the full product loop is
  treated as complete.
- Check that AI generation visibly cites its inputs: profile, routine, recent
  events, care items, scenario, and owner notes.
- Check that scan/OCR is not implemented or claimed in MVP3.
- Check that daily-event text/video recap monetization is documented only as a
  future CAPABILITY/GROWTH candidate and is not shown as a live MVP3 feature.
- Check that CatCare pricing UI uses USD (`$`) and sandbox/test copy, not CNY
  (`¥`) or live-payment claims.
- Check that menu active state follows the PRODUCT-00 route map and `/s/[token]`
  never renders owner navigation.
- Check that button enable/disable states match prerequisites in PRODUCT-00.
- Check that the current PR description labels the active issue accurately.
  GNE-280 UI/SYSTEM work must not be described as completing GNE-251 DATA or
  GNE-252 APP, and vice versa.

## Latest Run

2026-07-07 GNE-257 anonymous view QA:

- Scope verified: anonymous `/s/[token]` read-only sitter view for valid
  share tokens, plus expired/revoked/invalid empty states.
- Non-goals preserved: no anonymous submit, no RLS rewrite, no live
  AI/payment/entitlement behavior, no owner navigation, and no raw token in
  evidence or committed files.
- Passed `pnpm typecheck`, `pnpm lint`, and `pnpm build`; build output included
  dynamic route `ƒ /s/[token]`.
- Production-built local server ran on `http://127.0.0.1:3003` against the
  linked Supabase test env.
- Online test Supabase verification inserted temporary active/expired/revoked
  `share_tokens`, fetched valid/expired/revoked/invalid pages, confirmed status
  copy and no forbidden owner/billing/token text, then deleted the temporary
  rows.
- Valid state returned `200`, showed the private handoff shell and task list,
  included mobile viewport metadata, and did not show submit UI.
- Expired, revoked, and invalid states returned `200`, showed their explicit
  status copy, and did not show the task list.
- Mobile browser QA passed:
  `390px` valid state body/main width matched viewport, task list was present,
  no owner nav or forbidden text, and no horizontal overflow; screenshot
  captured at `/var/folders/rs/vhf5x8dj5xgf9w3qh983f7lc0000gn/T/gne257-mobile-valid-390-viewport-v2.png`.
  `375px` invalid state body/header/section widths matched viewport, invalid
  status was present, task list was absent, no owner nav or forbidden text, and
  no horizontal overflow; screenshot captured at
  `/var/folders/rs/vhf5x8dj5xgf9w3qh983f7lc0000gn/T/gne257-mobile-invalid-375-viewport-v2.png`.
- Temporary browser handoff files and Supabase rows were deleted after QA.

2026-07-06 GNE-255 analytics QA:

- Scope verified: owner-side CatCare page-level analytics, CatCare shell
  navigation analytics, owner plan-action analytics events, and page-level
  smoke coverage for the current CatCare SaaS UI.
- Non-goals preserved: no ACCESS share token or anonymous submission flow, no
  PRODUCT-03/04 feature buildout, no live AI/payment/real entitlement behavior,
  and no PostHog event treated as business truth.
- Passed `git diff --check`, `pnpm test:package-boundaries`,
  `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
- Local web ran on `http://127.0.0.1:3003` against the linked Supabase test
  env. Temporary Auth user `gne255-owner@example.test` logged in through
  `/login?next=/catcare`.
- In-app browser smoke passed with no console errors for `/catcare`,
  `/catcare/cats`, `/catcare/routines`, `/catcare/items`, `/catcare/events`,
  `/catcare/plans`, `/catcare/results`, `/account/billing`, and
  `/account/usage`; screenshot captured at
  `/private/tmp/gne-255-catcare-owner-smoke.png`.
- Boundary self-check: newly added analytics properties are normalized keys or
  counts/status fields only; raw ids, notes, titles, emails, tokens, private
  care-submission content, and payment identifiers are not sent by the new
  CatCare analytics paths.
- Linked test cleanup verification passed after deleting the temporary Auth
  user: `auth.users` and `public.user_profiles` both returned zero
  `gne255-%@example.test` / GNE-255 profile rows.

2026-07-06 GNE-254 setup:

- Added `supabase/tests/catcare_owner_rls.sql` for CatCare owner-only RLS
  acceptance.
- The script rolls back all test Auth users and CatCare rows, so it can run
  against the linked test database without leaving seed data behind.
- Linked test database read-only metadata check passed: all 8 CatCare tables
  have RLS enabled, each table has 4 authenticated owner policies,
  `authenticated` has select access, and `service_role` grants exist.
- Linked test database migration history records `20260629075823`
  `create_reference_product_owner_model`. Later local product-catalog
  migrations were not recorded in the linked migration history query, but they
  are outside the 8 owner-only tables covered by this GNE-254 RLS script.
- Linked test database rollback-only A/B script passed with:
  `supabase db query --linked --file supabase/tests/catcare_owner_rls.sql`.
- `supabase db reset` passed on local Supabase after Colima was started.
- `supabase db query --local --file supabase/tests/catcare_owner_rls.sql`
  failed on CLI v2.107.0 with
  `cannot insert multiple commands into a prepared statement`.
- Passed by executing the same SQL file through the local Postgres container:
  `docker cp supabase/tests/catcare_owner_rls.sql supabase_db_ai-web-starter-kit:/tmp/catcare_owner_rls.sql`
  then
  `docker exec supabase_db_ai-web-starter-kit psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/catcare_owner_rls.sql`.
- Verified: 8 CatCare tables have RLS, 32 authenticated owner policies exist,
  owner A can read only owner A rows, owner A cross-owner inserts are rejected,
  owner A update of owner B cat affects zero rows, and `anon` cannot read or
  write owner-only CatCare tables.
- Browser A/B validation used two temporary Supabase Auth Admin-created users
  in the linked test project, plus `GNE254`-prefixed CatCare rows, then removed
  them immediately after validation.
- Local web ran on `http://127.0.0.1:3003` against the linked test Supabase
  env. Owner A login reached `/catcare`; `/catcare/cats` showed
  `GNE254 Mochi` and did not show `GNE254 Nori`; `/catcare/results` showed
  `GNE254 owner A plan` and did not show owner B plan. Screenshot captured for
  owner A results.
- Owner B login reached `/catcare`; `/catcare/cats` showed `GNE254 Nori` and
  did not show `GNE254 Mochi`; `/catcare/results` showed
  `GNE254 owner B plan` and did not show owner A plan. Screenshot captured for
  owner B results.
- Linked test cleanup verification passed after deleting the temporary Auth
  users: `auth.users`, `cats`, `care_routines`, `care_routine_items`,
  `care_plans`, `care_tasks`, and `care_submissions` all returned zero
  `GNE254` / `gne254` rows.

2026-06-30:

- Passed `pnpm test:package-boundaries`, `pnpm test:release-boundaries`,
  `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and
  `git diff --check` after the
  GNE-280 route-boundary update, `/catcare` route migration, CatCare skeleton
  routes, CatCare billing UI update, and CatCare Landing/Login visual asset
  addition at `apps/web/public/catcare/hero-handoff.png`.
- Local dev server ran on `http://127.0.0.1:3006`.
- HTTP smoke passed:
  `/` -> 200,
  `/demo` -> 200,
  `/demo/account` signed out -> 307 to `/demo/login?next=%2Fdemo%2Faccount`,
  `/demo/account/billing` signed out -> 307 to
  `/demo/login?next=%2Fdemo%2Faccount%2Fbilling`,
  `/demo/account/usage` signed out -> 307 to
  `/demo/login?next=%2Fdemo%2Faccount%2Fusage`,
  `/dashboard` signed out -> 307 to `/demo/login?next=/dashboard`,
  `/login?next=/catcare` -> 200,
  `/demo/login?next=/dashboard` -> 200,
  `/account` signed out -> 307 to `/login?next=/account`,
  `/account/billing` signed out -> 307 to `/login?next=/account/billing`,
  `/catcare` signed out -> 307 to
  `/login?next=/catcare`,
  `/catcare/cats` signed out -> 307 to
  `/login?next=%2Fcatcare%2Fcats`,
  `/catcare/routines` signed out -> 307 to
  `/login?next=%2Fcatcare%2Froutines`,
  `/catcare/items` signed out -> 307 to
  `/login?next=%2Fcatcare%2Fitems`,
  `/catcare/events` signed out -> 307 to
  `/login?next=%2Fcatcare%2Fevents`,
  `/catcare/plans` signed out -> 307 to
  `/login?next=%2Fcatcare%2Fplans`,
  `/catcare/plans/demo/results` signed out -> 307 to
  `/login?next=%2Fcatcare%2Fplans%2Fdemo%2Fresults`,
  `/reference-product` -> 307 to `/catcare`,
  `/reference-product/plans/demo/results` -> 307 to
  `/catcare/plans/demo/results`.
- In-app browser control timed out during DOM-level visual verification, while
  dev server logs confirmed `/` returned `200`; signed-in visual screenshot
  verification remains pending.

2026-06-30 GNE-280 UI critique follow-up:

- Accepted the product/UI critique that GNE-280 must cover product-grade
  Landing, Login, `/catcare`, `/account/billing`, and `/account/usage`, while
  full CRUD, real AI generation, anonymous share-token security, and
  Order/Entitlement return remain later issue scope.
- `/catcare` now shows the product loop: cat/routine context -> AI-generated
  temporary checklist -> private sitter handoff -> owner review and paid recap.
- `/catcare/cats|routines|items|events|plans|results` skeleton pages now show
  product preview cards instead of a generic empty placeholder.
- `/account/usage` now carries CatCare AI Credit context without adding new
  billing or AI execution logic.
- Passed `pnpm typecheck`, `pnpm lint`, `pnpm test:release-boundaries`,
  `pnpm test:package-boundaries`, and `git diff --check`.
- HTTP smoke passed on `http://127.0.0.1:3006`:
  `/` -> 200,
  `/login?next=/catcare` -> 200,
  `/catcare` -> 307 to `/login?next=%2Fcatcare`,
  `/catcare/routines` -> 307 to `/login?next=%2Fcatcare%2Froutines`,
  `/catcare/events` -> 307 to `/login?next=%2Fcatcare%2Fevents`,
  `/account/usage` -> 307 to `/login?next=/account/usage`,
  `/account/billing` -> 307 to `/login?next=/account/billing`.

2026-06-29:

- Passed `pnpm test:package-boundaries`, `pnpm typecheck`, `pnpm lint`,
  `pnpm build`, and `git diff --check` after PRODUCT02 schema/type expansion.
- Passed local HTTP smoke with the dev server on `http://127.0.0.1:3006`:
  `/` GET -> 200, `/login?next=/catcare` GET -> 200,
  `/catcare` signed out -> 307 to `/login?next=/catcare`,
  `/account` signed out -> 307 to `/login?next=/account`,
  `/account/billing` signed out -> 307 to `/login?next=/account/billing`,
  `/account/usage` signed out -> 307 to `/login?next=/account/usage`.
- Verified CatCare landing/login/footer/account shells no longer link foundation
  demo routes as part of the main product flow.
- `supabase db reset --local` is blocked by local Colima/VZ:
  `failed to run attach disk "colima", in use by instance "colima"`.
- Applied
  `supabase/migrations/20260629075823_create_reference_product_owner_model.sql`
  to the linked remote Supabase test project through `supabase db query
  --linked --file` because direct `db push` and `migration repair` Postgres
  sessions failed from this machine with TLS EOF.
- Passed remote SQL verification: all 8 PRODUCT02 tables exist, RLS is enabled,
  each table has 4 owner policies, `authenticated` and `service_role` grants are
  present, and migration version `20260629075823` is recorded in
  `supabase_migrations.schema_migrations`.
- Reloaded PostgREST schema and passed remote REST smoke with the service key:
  all 8 PRODUCT02 tables returned `200 ok`.

## Regression Risks

- Continuing implementation before GNE-278 is reflected in page routes could
  hard-code the old single-workspace shape and cause rework.
- RLS policy mistakes could block owner reads/writes or expose another owner's data, especially through routine/task child tables.
- Server Action validation could diverge from database constraints.
- Product capability copy could make GNE-233 look done before capability wiring exists.
- Future ACCESS work must avoid logging raw private-link tokens.
