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

- Path: `/reference-product` while signed out.
  - Expected result: redirects to `/login?next=/reference-product`.
- Path: `/`.
  - Expected result: CatCare product homepage is the first screen, with primary CTA to CatCare signup/workspace and secondary CTA to the CatCare flow section.
- Path: `/login?next=/reference-product`.
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
- Path: `/reference-product` while signed in.
  - Expected result: page renders owner product UI, empty state, cat form, plan form, plan list, and account/billing/usage entries.
- Path: create cat, create plan, publish plan.
  - Expected result: plan appears in the list and changes from draft to published.

## Manual Verification

- Review `specs/reference-product/gne-278-product-flow.md` before changing
  PRODUCT implementation. It is the current page-map and prototype gate.
- Compare implementation pages against
  `specs/reference-product/prototypes/catcare-gne-278-flow-board-v6.png` for
  the current bilingual interaction flow, while treating text and numbers as
  non-binding placeholders.
- Review mobile and desktop layouts for text overflow.
- Check that `/account`, `/account/billing`, and `/account/usage` remain separate shared account surfaces for now.
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
- Check that the current PR description labels this as a historical
  `GNE-251 PRODUCT-02 DATA` exception and explicitly says GNE-280 UI/SYSTEM and
  GNE-252 APP remain separate follow-up PRs.

## Latest Run

2026-06-29:

- Passed `pnpm test:package-boundaries`, `pnpm typecheck`, `pnpm lint`,
  `pnpm build`, and `git diff --check` after PRODUCT02 schema/type expansion.
- Passed local HTTP smoke with the dev server on `http://127.0.0.1:3006`:
  `/` GET -> 200, `/login?next=/reference-product` GET -> 200,
  `/reference-product` signed out -> 307 to `/login?next=/reference-product`,
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
