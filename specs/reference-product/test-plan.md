# Test Plan: MVP3 Reference Product

## GNE-267 Resilience Matrix

- Gate outcomes expose no private plan data on failure.
- Repeated submission remains idempotent.
- Outbox covers sent, retry, dead letter, and competing claims.
- Outbox ready rows cannot be starved by future retries or active processing leases.
- Billing reserves before Provider use; credit-only partial state is not effective usage and reconciliation converges without a second Provider call.
- AI/PostHog failure is non-destructive; critical Audit failure is explicit.
- Audit retries use a deterministic safe UUID insert, so concurrent same-content writes are atomic without storing notes or secrets.

## Unit Tests

- `pnpm test:package-boundaries`
  - Confirms package public-entry usage and product-object boundary rules.
- GNE-261 document boundary check
  - Confirms `specs/reference-product/capability-action-map.md` records
    business action, product fact, capability mapping, adapter boundary,
    foundation decision, Cloudflare/Hono risk, and owning issue.
  - Confirms CAP-01 does not add runtime code, migrations, online Supabase
    writes, or a generic share-token package.

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

2026-07-08 GNE-262 CAPABILITY audit checks:

- Unit evidence: `pnpm --filter @xwlc/web test` covers audit payload redaction
  and owner-visible activity mapping.
- Type evidence: `pnpm --filter @xwlc/web typecheck`.
- Boundary evidence: `pnpm test:package-boundaries`,
  `pnpm test:release-boundaries`, and `git diff --check`.
- DB evidence before Done must confirm the linked test database has
  `audit_events`, RLS enabled, authenticated owner read policy, and service-role
  insert access.
- Browser evidence before Done must include desktop and 390px mobile plan detail
  with "分享与安全记录" visible and no horizontal overflow.
- Negative evidence must search for forbidden audit fields: raw token, token
  hash, owner email, full note text, and private handoff text must not enter
  audit payload construction.

2026-07-08 GNE-263 CAPABILITY outbox checks:

- Unit evidence: `pnpm --filter @xwlc/web test` covers outbox payload redaction
  and existing anonymous submission policy/audit tests.
- Type evidence: `pnpm --filter @xwlc/web typecheck`.
- Boundary evidence: `pnpm test:package-boundaries`,
  `pnpm test:release-boundaries`, and `git diff --check`.
- Build evidence: `pnpm --filter @xwlc/web build`.
- DB evidence before Done must confirm the linked test database has
  `outbox_events`, RLS enabled, authenticated owner read policy, service-role
  insert access, unique `idempotency_key` index, and migration versions
  recorded.
- Structural evidence must confirm `share-tokens.ts` has been split before
  Outbox is wired and no Outbox logic is piled into the old share-token file.
- Negative evidence must search for forbidden Outbox fields: raw token, token
  hash, owner email, full note text, and private handoff text must not enter
  outbox payload construction.

2026-07-08 GNE-264 CAPABILITY AI recap checks:

- Unit evidence: `pnpm --filter @xwlc/web test` covers CatCare AI recap prompt
  construction from structured result summary and verifies private note text is
  excluded.
- Type/build evidence: `pnpm --filter @xwlc/web typecheck` and
  `pnpm --filter @xwlc/web build`.
- Boundary evidence: `pnpm test:package-boundaries`,
  `pnpm test:release-boundaries`, and `git diff --check`.
- Browser/route evidence before Done must confirm `/catcare/results` and a
  plan result route can compile in the local app without breaking the owner
  result page. Signed-in visual QA should verify the intelligent recap panel
  shows generated, blocked, and failed states without replacing real
  `care_submissions`.
- Ledger evidence should show only allowlisted request metadata:
  `correlation_id`, `resource_id`, `resource_type`, and `request_source`.
- Negative evidence must search the prompt/action code for forbidden fields:
  raw share token, token hash, owner email, full sitter notes, and private
  handoff text must not enter AI prompt construction or capability metadata.

2026-07-10 GNE-264 verification snapshot:

- `pnpm --filter @xwlc/web test`: 20 passed, including the new zero-quota
  availability regression and structured prompt privacy checks.
- `pnpm --filter @xwlc/web typecheck`, `pnpm test:package-boundaries`,
  `pnpm test:release-boundaries`, `git diff --check`, and
  `pnpm --filter @xwlc/web build`: passed.
- Local route smoke after a clean dev-server start: `/login` returned 200;
  `/account/billing` and `/catcare/plans` returned protected 307 redirects.
- Authenticated interaction smoke passed for the owner plan list and an
  existing result/recap route. Desktop 1440x800 and mobile 390x844 showed no
  horizontal overflow. Evidence: `/private/tmp/gne264-results-desktop-1440.png`
  and `/private/tmp/gne264-results-mobile-390.png`.

2026-07-08 GNE-265 CAPABILITY Billing/Credit return-flow checks:

- Type/build evidence: `pnpm --filter @xwlc/web typecheck` and
  `pnpm --filter @xwlc/web build`.
- Boundary evidence: `pnpm test:package-boundaries`,
  `pnpm test:release-boundaries`, and `git diff --check`.
- Browser/route evidence before Done must confirm:
  `/account/usage?return_to=/catcare/plans/<id>/results` renders the CatCare
  Paywall context, `/account/payment/checkout?price_id=ai_credit_pack_100k&return_to=/catcare/plans/<id>/results`
  reaches the sandbox checkout, and sandbox success/cancel/failure returns to
  the original CatCare route with payment result markers.
- Security evidence must confirm return URL allowlisting rejects external URLs,
  protocol URLs, double-slash URLs, and prefix-confusion paths such as
  `/catcareevil`.
- Billing evidence must inspect server-side order/entitlement/credit/usage
  records for the test owner after sandbox success; route query params alone
  are not entitlement proof.

2026-07-10 GNE-265 verification snapshot:

- The same test/type/build/boundary commands above passed after Billing section
  extraction; `catcare-billing-overview.tsx` decreased from 681 to 343 lines.
- Internal return tests cover external URL, protocol URL, double-slash, exact
  root, and sibling-prefix rejection.
- Online test Supabase REST checks returned 200 for `billing_entitlements`,
  `billing_usage_ledger`, and `billing_credit_ledger`. Nineteen sampled AI
  entitlement rows and twenty sampled usage rows used `credit`; no sampled
  quantity, quantity-used, or usage value violated the 10000-credit block rule.
- `supabase migration list` was `not_run` as evidence after the remote CLI
  connection returned a TLS EOF; runtime table data was checked directly
  instead and no local Supabase instance was used.
- Authenticated Billing visual smoke passed at desktop 1440x800 and mobile
  390x844 without horizontal overflow. Evidence:
  `/private/tmp/gne265-billing-desktop-1440.png` and
  `/private/tmp/gne265-billing-mobile-390.png`.
- Creem Test Mode payment completed and returned to the originating CatCare
  result route with `payment_result=success`. Evidence:
  `/private/tmp/gne265-catcare-return-desktop-1440.png`.
- Server-side evidence for order `2c64812f-b5ab-490c-8eae-f439f688f341`
  confirmed `paid`, 900 cents, one active 100000-credit entitlement, and one
  100000-credit grant ledger. Replaying the successful return kept those counts
  at one each, so the callback/return path did not duplicate the grant.

2026-07-08 GNE-261 CAPABILITY action-map checkpoint:

- No browser interaction is required because GNE-261 is a mapping and
  architecture handoff issue.
- Required evidence: `git diff --check`, `pnpm test:package-boundaries`,
  `pnpm test:release-boundaries`, and a text search proving
  `capability-action-map.md`, `foundation_decision`, and
  `cloudflare_hono_risk` are present in the reference-product specs/context.
- Reviewers should use the map before starting GNE-262 through GNE-267 to
  ensure each runtime issue keeps actor, owner scope, anonymous token scope,
  `correlation_id`, and `idempotency_key` explicit.

2026-07-07 GNE-290 checkpoint:

- Current local pass covers V6 06-11 PRODUCT polish direction but does not mark
  GNE-290 Done.
- Passed commands: `pnpm --filter @xwlc/web typecheck`,
  `pnpm --filter @xwlc/web lint`, `pnpm --filter @xwlc/web test`,
  `pnpm --filter @xwlc/web build`, `pnpm test:package-boundaries`,
  `pnpm test:release-boundaries`, and `git diff --check`.
- Local dev server restarted on `http://127.0.0.1:3003`.
- Browser mobile check at 390px for `/s/invalid-token-for-visual-check`
  confirmed `scrollWidth=390`, `clientWidth=390`, one page H1, and no plan
  content leakage.
- Pending before Done: signed-in owner screenshots for `/catcare/items`,
  `/catcare/events`, `/catcare/plans`, and `/catcare/plans/[id]`; valid
  active-token `/s/[token]` mobile screenshot and submission interaction; final
  three-party review.

2026-07-07 GNE-290 product-feedback checks:

- 06 Food & Care Items: click each category tab and verify the visible rows are
  filtered to that category.
- 06 Food & Care Items: verify no unfinished scan/OCR/upload affordance appears
  as a usable product control.
- 06-11 visible product UI: verify Chinese mode does not show prototype English
  suffixes or exposed prototype labels.
- 06 Food & Care Items: verify row visuals use consistent category icons rather
  than mismatched package/product images.

2026-07-07 GNE-290 product-quality rework checks:

- Supersedes the earlier inline-SVG icon pass. Product object visuals must come
  from `apps/web/public/catcare/icons/prototype/` image assets and be listed in
  `apps/web/public/catcare/icons/inventory.md`.
- 06/07/11 visual QA must verify item, event, routine/task, and sitter task
  icons share the same product illustration language. Functional action buttons
  may continue to use currentColor line icons.
- 08 generation QA must verify the AI input summary column is not used as the
  history-plan container; existing plans are secondary to generating a new care
  plan.
- 09/10 owner plan QA must verify published plans read as a care-plan overview
  with execution date, task count, cats, schedule, share state, and result
  entry.
- 11 private execution QA must verify mobile task cards clarify category,
  required/optional status, family-vs-cat scope, current-day submit gating, and
  post-submit note/exception follow-up.
- Automated evidence already passed after this rework:
  `pnpm --filter @xwlc/web typecheck`,
  `pnpm --filter @xwlc/web lint`,
  `pnpm --filter @xwlc/web test`,
  `pnpm --filter @xwlc/web build`,
  `pnpm test:package-boundaries`,
  `pnpm test:release-boundaries`, and `git diff --check`.
- HTTP smoke on `http://127.0.0.1:3003` was run through sandbox-external curl:
  `/catcare/items`, `/catcare/events`, and `/catcare/plans` return protected
  owner redirects when signed out; `/s/invalid-token-smoke` returns `200 OK`.
- Screenshot evidence now includes invalid-link mobile QA:
  `/private/tmp/gne290-invalid-390-r3.png` at 390px. This caught and fixed a
  horizontal text clipping issue in the invalid-link state.
- Latest screenshot evidence now includes authenticated owner 06-10 and valid
  active-token 11 local QA:
  `/private/tmp/gne290-06-items-desktop.png`,
  `/private/tmp/gne290-07-events-desktop.png`,
  `/private/tmp/gne290-08-plans-desktop.png`,
  `/private/tmp/gne290-09-plan-detail-desktop.png`,
  `/private/tmp/gne290-10-private-share-mobile.png`,
  `/private/tmp/gne290-11-sitter-mobile.png`,
  `/private/tmp/gne290-11-sitter-mobile-tasks.png`, and
  `/private/tmp/gne290-11-sitter-mobile-accordion.png`.
- Captured viewport metrics: owner desktop pages stayed at
  `scrollWidth=1440 / viewport=1440`; private mobile pages stayed at
  `scrollWidth=390 / viewport=390`.
- 3003 style recovery check: corrupted/stale `.next` dev cache caused global
  CSS/runtime chunk failures. After deleting `apps/web/.next` and restarting,
  sandbox-external curl verified `/login 200 OK` and
  `/_next/static/css/app/layout.css 200 OK` with `Content-Length: 73987`.
- Final closeout must include cleanup evidence for the isolated online QA
  owner/token rows, Linear sync, and final three-party review.

2026-07-07 GNE-290 icon-quality regression check:

- Visual QA rejected raw product PNG icon crops where white backing shapes were
  visible or event/category semantics were unclear.
- Current check must verify 06 item category tabs, add-item type buttons, 07
  event type buttons, 07 timeline markers, plan task rows, and sitter task cards
  use the shared product-local semantic SVG glyph system instead of raw PNG
  crops with baked-in frames.
- Event timeline QA must verify connector lines stop before/after the icon
  marker and do not run through the icon box.
- Fresh final screenshot evidence after this correction:
  `/private/tmp/gne290-final-06-items-desktop.png` and
  `/private/tmp/gne290-final-07-events-desktop.png`, both with
  `scrollWidth=1440 / viewport=1440`.
- Follow-up icon QA requires the runtime glyphs to render as product badges
  with category-specific tones, not bare engineering line icons. The event
  timeline spine should be visible as a timeline structure while each marker
  masks the line through the icon itself.
- Full refreshed screenshot set after this pass:
  `/private/tmp/gne290-final-06-items-desktop.png`,
  `/private/tmp/gne290-final-07-events-desktop.png`,
  `/private/tmp/gne290-final-08-plans-desktop.png`,
  `/private/tmp/gne290-final-09-plan-detail-desktop.png`,
  `/private/tmp/gne290-final-10-share-desktop.png`,
  `/private/tmp/gne290-final-11-sitter-mobile.png`, and
  `/private/tmp/gne290-final-11-sitter-mobile-tasks.png`.

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

2026-07-08 GNE-260 ACCESS security negative matrix:

- Added `specs/reference-product/access-security-negative-matrix.md` as the
  reusable ACCESS-06 checklist for private-link and anonymous-submit negative
  paths.
- The matrix covers owner A/B cross-owner access, share-token create/revoke
  boundaries, expired/revoked/tampered tokens, repeated link generation,
  duplicate submits, forwarded-link minimum scope, direct anonymous DB read/write
  rejection, direct submit validation, and raw-token leakage checks.
- Audit scope is contract-only in ACCESS: required events, allowed fields, and
  forbidden fields are defined for CAP-02 without adding an `audit_events` table
  or runtime Audit facade here.
- Foundation judgment is explicit: token hash/scope/expiry/revocation,
  anonymous actor context, whitelist, idempotency, and the negative matrix are
  `common_pattern_not_extracted` or `common_contract_verified`; CatCare table
  fields remain `catcare_specific`; durable audit is `not_run` until CAP-02.
- Cloudflare/Hono portability is documented: current service-level owner/token
  filters and server-side whitelist survive a no-RLS repository adapter, while
  service-role anonymous reads, missing full `correlation_id` propagation, and
  not-yet-implemented audit storage are carried as migration risks.

2026-07-08 GNE-259 owner/anonymous access boundary:

- Added `supabase/tests/catcare_access_boundary.sql` as the combined ACCESS-05
  SQL acceptance script. It creates rollback-only Owner A/B cats, plans, tasks,
  submissions, and share tokens, then verifies owner A cannot read or mutate
  owner B rows across `cats`, `care_plans`, `care_tasks`, `care_submissions`,
  and `share_tokens`.
- The same script verifies anonymous database role cannot directly read cat
  private rows, care plan/task/submission rows, or `share_tokens`, and cannot
  directly write share-token or care-submission rows.
- App-layer boundary evidence: owner share-link management first resolves the
  authenticated owner and then queries `care_plans`/`share_tokens` with
  explicit `owner_id`, `resource_type`, `resource_id`, and `scope` filters in
  `apps/web/lib/catcare/product-service/share-tokens.ts`.
- App-layer anonymous evidence: `/s/[token]` resolves a token into an
  `anonymous_token` scope and all anonymous plan reads/submission writes use
  the derived `ownerId`, `resourceId`, task id, service date, and visit-time
  boundary. The anonymous token is not treated as a logged-in owner identity.
- Portability check: the service/repository layer does not rely only on page
  routing or database RLS; critical owner and anonymous queries carry explicit
  owner/token scope conditions, preserving a minimal path for future no-RLS
  storage such as Cloudflare D1.

2026-07-07 GNE-258 / GNE-290 boundary correction:

- GNE-258 acceptance is restricted to ACCESS technical evidence: anonymous
  share-token submit, real `care_submissions`, field whitelist,
  service-date/visit validation, duplicate/update behavior, and owner result
  visibility.
- GNE-258 must not be used as evidence that `/s/[token]` has reached final V6
  prototype/product quality.
- PRODUCT polish for prototype screens 06-11 is tracked by GNE-290 and must be
  verified in order: food/care items, event timeline, scenario inputs,
  generate/review, private share, and sitter checklist.

2026-07-08 GNE-258 regeneration test point:

- Submit at least one anonymous task, regenerate the owner share link, confirm
  the old link is rejected, and confirm the new link still marks the same
  plan/date/visit/task slot as submitted.
- Re-submit the same slot from the new link and verify the service returns the
  duplicate/update path instead of inserting a second care result.
- GNE-290 browser evidence must include desktop and mobile visual QA, icon and
  button baseline review, no horizontal overflow, and three-party review:
  architecture boundary, UI/icon quality, and product interaction.

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

2026-07-07 GNE-290 latest local test notes:

- Use `http://localhost:3003` for authenticated owner browser QA on this
  machine. `http://127.0.0.1:3003` can redirect to login because browser
  cookies are host-scoped.
- 390px browser QA checks now include:
  `/catcare/items` category filter click (`猫砂 1` -> `猫砂（1）`),
  `/catcare/routines` prototype-image absence, `/catcare/events`,
  `/catcare/plans`, and invalid `/s/[token]` no-overflow smoke.
- Required before GNE-290 Done: valid active `/s/[token]` mobile QA, owner-side
  page screenshots after final review, and Linear checklist/status sync.
- Valid active `/s/[token]` mobile QA was run on 2026-07-07 with a temporary
  token at 390px. The raw token was not recorded in docs/evidence. Final
  cleanup later deleted the temporary online `share_tokens` row, isolated QA
  owner data, temporary Auth user, and local raw token/cookie temp files.

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

## GNE-266 Foundation Hardening Checks

- Run `pnpm --filter @xwlc/platform test` and `pnpm --filter @xwlc/platform typecheck`.
- Run `pnpm --filter @xwlc/web test` and `pnpm --filter @xwlc/web typecheck`.
- Run `pnpm test:package-boundaries` and `git diff --check`.
- Assert the capability context has exactly `correlation_id`, `resource_id`,
  `resource_type`, and `request_source`, with value-level negative cases for
  URLs, whitespace/private text, oversized data, and bearer-like strings.
- Assert the PostHog adapter uses `/i/v0/e/`, preserves top-level identity/event
  fields, drops query/hash data, and redacts high-entropy bearer segments on
  both known and previously unknown routes without redacting normal UUID paths.
- Assert CatCare event names/properties live only in its product adapter and the
  shared transport accepts a future product's bounded primitive property
  without adding that property to a central product allowlist.
- Assert share authorization-state tests run from the package public entry while
  app crypto tests cover generation, hashing, and constant-time verification.
- Assert every CatCare server product event awaits the Analytics facade instead
  of leaving an unmanaged `void trackCatCareProductEvent(...)` Promise.
- Assert Provider exceptions, HTTP failures, and an abort-aware short timeout
  settle with a safe warning while preserving the already successful business
  result. Lock the shared server capture timeout at 1 second.
- Re-run a deployed anonymous share view and submission, then verify fresh
  `catcare_share_page_viewed` and `catcare_submission_created` events in the
  current PostHog test Project with safe shared properties and correlation IDs.
- Confirm there are no migration or visible-page changes.

## Regression Risks

- Continuing implementation before GNE-278 is reflected in page routes could
  hard-code the old single-workspace shape and cause rework.
- RLS policy mistakes could block owner reads/writes or expose another owner's data, especially through routine/task child tables.
- Server Action validation could diverge from database constraints.
- Product capability copy could make GNE-233 look done before capability wiring exists.
- Future ACCESS work must avoid logging raw private-link tokens.

## GNE-288 Cat Profile Lifecycle Regression

- Rebuild a clean local Supabase database twice from repository migrations.
- Prove draft/published plans and active share links block archival.
- Prove database invariants reject a foreign-owner participant, reject a new
  active plan for an archived cat, and prevent archived participant history
  from being republished; plan writes and archival must lock the same cat rows.
- Prove reviewed/closed history permits archival without physically deleting
  cats, routines, items, events, tasks, submissions, or plan snapshots.
- Under the owner role, prove archived aggregate data is invisible while plan
  history remains visible and uses `（已删除）` participant labels.
- Prove another owner cannot archive the cat and authenticated users cannot
  issue a direct `DELETE` against `cats`.
- Rebuild to the migration immediately before GNE-288, load the committed
  cross-owner legacy-plan fixture, apply the GNE-288 migration, and prove the
  foreign participant becomes a neutral tombstone without exposing its id or
  name.
- Prove `cat-photos` is private and only an active, same-owner, referenced photo
  is readable/updateable/deletable. Anonymous, archived-cat, cross-owner, and
  uploaded-but-unreferenced objects must not be listable; legacy public URLs
  must stop working after the bucket transition.
- Prove a historical plan whose legacy primary cat was archived can still move
  through its remaining lifecycle.
- Run CatCare owner RLS, anonymous access, share-token, share-link, storage,
  unit, typecheck, package-boundary, and production-build regressions.
