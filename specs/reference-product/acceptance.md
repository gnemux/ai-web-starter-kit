# Acceptance: MVP3 Reference Product

## Functional Checks

- [x] Signed-out users opening `/catcare` are redirected to login with `next=/catcare`.
- [x] `/reference-product*` is only a legacy compatibility shim and redirects to `/catcare*`.
- [x] `/` presents CatCare as the product first screen, not a generic starter page.
- [x] `/login` presents CatCare login/signup context and defaults to `/catcare`.
- [x] `/demo` and `/demo/login` preserve the foundation demo entry without duplicating Auth logic.
- [x] Demo account, billing/order-record, and usage routes are isolated under `/demo/account*`.
- [x] Demo protected routes redirect to `/demo/login`; CatCare protected routes redirect to `/login`.
- [x] Signed-in owners can create a cat profile.
- [x] Signed-in owners can create a care plan with a first task.
- [x] Draft care plans can be published.
- [x] The owner can see plan state, tasks, and the future submission area.
- [x] The page exposes account, billing/payment, and AI Credit entry slots without claiming GNE-233 capability wiring is complete.

## Technical Checks

- [ ] `supabase db reset` succeeds from repository migrations.
- [x] Product tables have RLS enabled and owner policies in the linked remote
  test Supabase project.
- [x] `pnpm test:package-boundaries` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm lint` passes.
- [x] `pnpm build` passes.
- [x] No secrets, raw share tokens, private prompts, or customer data are committed.

## Product Checks

- [x] GNE-278 defines the current CatCare page map, prototype review, state matrix, and PRODUCT / ACCESS / CAPABILITY / VERIFY boundaries.
- [x] A confirmed 13-screen high-fidelity split prototype set exists at `specs/reference-product/prototypes/v6-regenerated-normalized/` as the current PRODUCT-00 prototype guidance.
- [x] The binding spec defines a short first-run path where cat profile,
  recurring routine, and scenario are enough to generate the first checklist.
- [x] The binding spec represents lightweight daily events plus food/treat/care
  items as optional AI-quality and retention inputs for the full product loop.
- [x] The binding spec sets USD as the CatCare MVP3 pricing display standard and treats any CNY pricing in generated prototype images as stale visual detail.
- [x] The homepage, login page, and workspace are understandable as one cat temporary-care product.
- [x] Product business objects stay in `apps/web`, not `packages/*`.
- [x] GNE-231/GNE-233 boundaries are visible in the page copy and docs.
- [x] Account, billing, payment, and AI Credit are represented as future product capability slots.
- [x] GNE-251 data-model review is gated by real CatCare shell pages: Landing,
  login/register, authenticated default workspace, and account/billing/usage
  entries must not be generic starter/demo UI.
- [x] Future daily-event recap monetization is recorded as a valid
  CAPABILITY/GROWTH candidate, not as MVP3 core scope.
- [x] Current PR scope is classified as a historical GNE-251 PRODUCT-02 DATA
  exception: mixed UI/APP work is allowed only as minimal data-verification
  shell and does not complete GNE-280 UI/SYSTEM or GNE-252 APP.
- [x] GNE-280 reopened as the active UI/SYSTEM issue after PR #44; GNE-252 was
  returned to Backlog because PR #44 does not complete final owner-side APP.

## PR Scope Classification

- DATA retained in current PR: migration, database types, data service, remote
  SQL/RLS/REST evidence, and DATA specs/status.
- UI/SYSTEM present but not complete: Landing, login/register, nav/footer,
  account/payment shell, i18n, and prototype guidance. These belong to GNE-280.
- APP present but not complete: Reference Product actions, forms, page-level
  create/publish flow. These belong to GNE-252.
- ACCESS not implemented: no share-token table, raw token, hash, anonymous page,
  or anonymous write gate.
- CAPABILITY not implemented: no live AI, paywall, checkout, entitlement gate,
  Audit, Outbox, or PostHog correlation.

## Verification Snapshot

2026-06-30 GNE-280 UI/SYSTEM verification:

- `pnpm test:package-boundaries`, `pnpm test:release-boundaries`,
  `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` passed.
- Local HTTP smoke on `http://127.0.0.1:3006` passed:
  `/demo/account`, `/demo/account/billing`, and `/demo/account/usage`
  signed out redirect to `/demo/login` with their original return paths;
  `/dashboard` signed out redirects to `/demo/login?next=/dashboard`.
- CatCare skeleton routes
  `/catcare/cats`, `/catcare/routines`,
  `/catcare/items`, `/catcare/events`,
  `/catcare/plans`, and `/catcare/plans/demo/results`
  signed out redirect to `/login` with their original CatCare return paths.
- Legacy `/reference-product*` routes redirect to matching `/catcare*` routes.
- `/account/billing` now uses the CatCare billing UI while
  `/demo/account/billing` keeps the foundation demo billing surface.
- Demo navigation is isolated under `/demo/account*`; CatCare navigation is
  isolated under `/catcare*` plus `/account*`.

2026-06-29 local verification:

- `pnpm test:package-boundaries`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `git diff --check` passed.
- HTTP smoke on `http://127.0.0.1:3006` passed:
  `/` GET -> 200, `/login?next=/catcare` GET -> 200,
  `/catcare` signed out -> 307 to `/login?next=/catcare`,
  `/account` signed out -> 307 to `/login?next=/account`,
  `/account/billing` signed out -> 307 to `/login?next=/account/billing`,
  `/account/usage` signed out -> 307 to `/login?next=/account/usage`.
- CatCare shell now keeps `/demo`, `/demo/login`, and `/dashboard` reachable as
  foundation demo routes without linking them from the CatCare landing/login,
  account nav, account menu, or footer product links.
- `supabase db reset --local` is blocked by local Colima/VZ disk lock:
  `failed to run attach disk "colima", in use by instance "colima"`.
- Remote Supabase linked SQL applied
  `supabase/migrations/20260629075823_create_reference_product_owner_model.sql`
  after direct `db push` / `migration repair` Postgres sessions failed with TLS
  EOF from this machine.
- Remote PRODUCT02 verification passed: `cats`, `care_routines`,
  `care_routine_items`, `care_items`, `care_events`, `care_plans`,
  `care_tasks`, and `care_submissions` all exist, RLS is enabled, each table has
  4 owner policies, and `authenticated` / `service_role` grants are present.
- Remote REST Data API smoke with the service key returned `200 ok` for all 8
  PRODUCT02 tables after PostgREST schema reload.
- Remote migration history now records version `20260629075823` with name
  `create_reference_product_owner_model`; this was repaired through linked SQL
  because the official CLI repair command uses the same failing direct Postgres
  connection path.
