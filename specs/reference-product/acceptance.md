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
- [x] A valid private share token opens `/s/[token]` for an unauthenticated
  sitter and shows only the minimum read-only handoff fields and task list.
- [x] Expired, revoked, invalid, and unavailable share links show explicit
  empty/error states and do not show care tasks.
- [x] Anonymous share pages do not render owner navigation, billing/payment/AI
  controls, owner email, internal ids, raw token, token hash, debug data, or
  anonymous submission UI.

## Technical Checks

- [x] `supabase db reset` succeeds from repository migrations.
- [x] Product tables have RLS enabled and owner policies in the linked remote
  test Supabase project.
- [x] `pnpm test:package-boundaries` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm lint` passes.
- [x] `pnpm build` passes.
- [x] No secrets, raw share tokens, private prompts, or customer data are committed.
- [x] Production-built `/s/[token]` HTML includes mobile viewport metadata and
  passes 375px/390px mobile QA with no horizontal overflow.

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
- [x] Historical PR #44 scope was limited to PRODUCT-02 DATA verification;
  GNE-280, GNE-252, GNE-288, GNE-253, GNE-254, and GNE-255 now carry the
  later UI/SYSTEM, APP, ARCH, DB/TEST, and ANALYTICS/QA completion evidence.

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

2026-07-07 GNE-258 / GNE-290 boundary correction:

- GNE-258 can be accepted only as ACCESS technical foundation after fresh
  evidence for anonymous submit, field whitelist, real `care_submissions`,
  service-date/visit validation, duplicate/update behavior, and owner result
  visibility.
- GNE-258 must not claim final PRODUCT-quality completion of the anonymous
  sitter UI.
- GNE-290 is the reopened PRODUCT polish issue for V6 prototype screens 06-11,
  executed in order and verified against the binding prototype folder plus
  `catcare-ui-guidelines.md`.
- GNE-290 must include three-party review evidence before Done: architecture
  boundary, UI/icon quality, and product interaction including mobile.

2026-07-07 GNE-290 progress checkpoint:

- Current local branch has a partial PRODUCT polish pass for V6 screens 06-11,
  but the issue is not accepted as Done.
- Passed evidence: `pnpm --filter @xwlc/web typecheck`, `lint`, `test`,
  `build`, `pnpm test:package-boundaries`, `pnpm test:release-boundaries`, and
  `git diff --check`.
- Browser evidence: 390px anonymous invalid-link state has no horizontal
  overflow and no plan-data leakage.
- Missing acceptance evidence before Done: authenticated owner visual QA for
  06-10, valid active-token sitter visual QA for 11, checklist completion in
  Linear, and final architecture/UI/product review notes.

2026-07-07 GNE-290 product-feedback checkpoint:

- Project rules and product usability take priority over literal prototype
  copy. Prototype screens 06-11 are used for flow and hierarchy, not for keeping
  mixed Chinese/English UI, unfinished features, or placeholder assets.
- 06 Food & Care Items must pass these corrected acceptance points:
  category tabs change the visible list, unimplemented scan/OCR is not shown as
  a product control, category visuals use consistent iconography, and item rows
  do not depend on broken or mismatched product images.
- Visible CatCare product UI should stay Chinese in Chinese mode; English
  suffixes from the prototype are not acceptance evidence.

2026-07-07 GNE-290 06-11 corrected acceptance checkpoint:

- 06 item-library acceptance now requires category tabs to perform real list
  filtering, item/category labels to come from one product-local source, and
  category visuals to use consistent in-app icons. Product photos or package
  recognition controls are not acceptable unless the underlying feature is in
  scope and designed end-to-end.
- 07 routine acceptance requires routine cards and item categories to share one
  product icon system. Runtime food/care/task meanings use product-local
  semantic glyph badges; raw prototype PNG crops are reference material only.
  Functional buttons still use the local currentColor action icon set.
- Chinese-mode acceptance rejects exposed `AI/live AI/AI Credit` wording in
  page titles, shell metrics, billing/usage copy, or explanatory copy; use
  `智能摘要` / `智能额度` product language unless a separate English locale is
  being reviewed.
- Current evidence covers authenticated owner mobile smoke for `/catcare/items`,
  `/catcare/routines`, `/catcare/events`, and `/catcare/plans` on
  `http://localhost:3003`, plus invalid anonymous `/s/[token]`. Final GNE-290
  Done still requires active-token sitter flow QA and final three-party review.

2026-07-07 GNE-290 product-quality correction:

- Raw prototype PNG crops and bare engineering-like line icons are rejected for
  the 06-11 polish pass. Product object/category/event/task visuals must use the
  product-local semantic glyph badge system, with provenance and runtime-source
  notes recorded in `apps/web/public/catcare/icons/inventory.md`.
- Prototype 06-11 remains a hierarchy and interaction reference, not a literal
  copy target: Chinese mode must not keep mixed Chinese/English labels, and
  unimplemented controls such as scan/OCR must not be shown as active features.
- Prototype 08 generation flow keeps history/plan management secondary to the
  generation task; history must not be forced into the AI input summary column.
- Prototype 11 private execution must be evaluated as mobile-first interaction:
  cat/family scope, current-day submit gating, visit/task progression, and
  task-card visual quality are part of Done evidence, not optional polish.

2026-07-07 GNE-290 active-token checkpoint:

- Valid anonymous `/s/[token]` mobile QA now covers page rendering, no owner nav,
  cat-specific vs `家庭共用` scope, current-day submit controls, future-day
  disabled state, and visit accordion behavior at 390px.
- The temporary online share-token row used for QA was later deleted before
  closure, and final three-party review evidence was recorded.
- The previous three-party product scores are no longer closure evidence
  because later PM/UI review rejected the interim product-object direction.
  Closure uses the later semantic glyph badge review and screenshots.

2026-07-07 GNE-290 cleanup and invalid-link QA checkpoint:

- The earlier temporary online `share_tokens` QA row was deleted from the linked
  Supabase test environment through sandbox-external REST cleanup
  (`deleted_rows 1`).
- System Chrome captured invalid-link mobile QA at
  `/private/tmp/gne290-invalid-390-r3.png` for 390px width after fixing a
  horizontal text clipping issue in `/s/[token]` invalid states.
- Latest local QA seed evidence covers authenticated owner visual QA for 06-10
  and valid active-token mobile QA for 11 after the semantic glyph badge rework:
  `/private/tmp/gne290-final-06-items-desktop.png`,
  `/private/tmp/gne290-final-07-events-desktop.png`,
  `/private/tmp/gne290-final-08-plans-desktop.png`,
  `/private/tmp/gne290-final-09-plan-detail-desktop.png`,
  `/private/tmp/gne290-final-10-share-desktop.png`,
  `/private/tmp/gne290-final-11-sitter-mobile.png`, and
  `/private/tmp/gne290-final-11-sitter-mobile-tasks.png`.
- Captured pages have no horizontal overflow at the tested viewports
  (`1440px` owner desktop and `390px` private mobile).
- A local 3003 style failure was traced to corrupted/stale Next dev `.next`
  output, not to an intended UI regression. After deleting `apps/web/.next` and
  restarting, sandbox-external curl verified `/login 200 OK` and
  `/_next/static/css/app/layout.css 200 OK` with `Content-Length: 73987`.
- Final cleanup later deleted the current isolated online QA owner/token rows:
  `share_tokens 1`, `care_tasks 7`, `care_plans 1`, `care_events 3`,
  `cat_item_assignments 12`, `owner_item_library 6`, `cats 2`,
  `user_profiles 1`, and `auth_user 1`; remaining inspected owner-scoped table
  counts were verified as `0`.

2026-07-07 GNE-257 ACCESS anonymous view verification:

- `pnpm typecheck`, `pnpm lint`, and `pnpm build` passed after implementing the
  anonymous view and global mobile viewport metadata.
- Production-built local server on `http://127.0.0.1:3003` rendered dynamic
  route `ƒ /s/[token]`.
- Linked Supabase test env verification used temporary active/expired/revoked
  share-token rows, then deleted them. Valid, expired, revoked, and invalid
  page checks all returned `200`, showed the expected state, and passed the
  forbidden owner/billing/token text scan.
- Mobile browser QA passed at `390px` valid and `375px` invalid states:
  viewport/body/main widths matched, no horizontal overflow, owner nav absent,
  forbidden owner/billing/token text absent, and screenshots were captured for
  local review.
- Boundary preserved: anonymous submit remains GNE-258; owner/anonymous RLS
  acceptance remains GNE-259; security negative/audit verification remains
  GNE-260.

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
