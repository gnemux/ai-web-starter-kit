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
- Remote linked Supabase query
  - Confirms the same 8 PRODUCT02 tables, RLS flags, owner policy counts,
    grants, and migration-history version in the shared test project.

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
- Path: `/catcare/cats`, `/catcare/routines`,
  `/catcare/items`, `/catcare/events`,
  `/catcare/plans`, and `/catcare/plans/[id]/results`
  while signed out.
  - Expected result: redirects to `/login` with the original CatCare return
    path preserved.
- Path: create cat, create plan, publish plan.
  - Expected result: plan appears in the list and changes from draft to published.

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
