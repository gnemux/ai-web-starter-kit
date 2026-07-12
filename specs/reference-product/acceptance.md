# Acceptance: MVP3 Reference Product

## GNE-270 Evidence

- [x] Fresh owner A/B, valid, expired, tampered, regenerated, revoked, direct
  anonymous read/write, Audit/Outbox, PostHog, and evidence-leakage checks are
  recorded in `security-negative-verification.md` without bearer credentials.
- [x] The final test link is revoked, the plan has zero active share tokens,
  and the temporary second-owner account plus cascading product rows are
  removed from the shared cloud test project.
- [x] A disposable local Supabase reset applied all 16 repository migrations;
  four rollback-only ACCESS security SQL suites passed.
- [x] Platform tests pass `5/5` and Web tests pass `76/76`; full repository
  publication checks remain required after the evidence diff is stable.
- [x] Travel can reuse the platform share gate, safe capability context,
  telemetry envelope, negative matrix, and adapter acceptance contract while
  retaining product-specific DTO/store/whitelist rules.
- [x] GNE-271 still owns cloud migration-history reconciliation; GNE-270 does
  not close GNE-234 or authorize automatic entry into the next child issue.

## GNE-268 Evidence

- [x] `reviewer-baseline.md` defines safe owner A, owner B, anonymous, Billing
  sandbox, and AI mock/no-op/sandbox preparation without committed credentials
  or bearer links.
- [x] Stable validation URL, deployed commit `1c2de2c`, successful GitHub CI and
  Vercel deployment, HTTP 200 entry check, and `sin1` observation are recorded.
- [x] Workspace package versions, logical `catcare-mvp3` contract, repository
  migration range, and read-only reference/test data aggregates are recorded.
- [x] Exact remote migration-history parity is explicitly `fail`, not hidden:
  the remote history has 11 rows versus 16 repository migrations and records a
  different share-token migration timestamp. GNE-271 owns reconciliation.
- [x] Full runbook, security-negative checks, patch/migration rehearsal,
  provider evidence consolidation, deployed product smoke, live AI/payment,
  and true production database verification remain assigned to their declared
  later VERIFY issues or `not_run` boundaries.

## GNE-267 Evidence

- [x] Package root API stays compatible and Travel root-import consumption is proven.
- [x] Outbox lease/CAS/retry/dead-letter and Billing reservation/CAS/timeout/reconciliation paths have executable tests.
- [x] Critical submission effects repair on retry; Audit uses deterministic safe IDs; AI/PostHog failures remain non-destructive.
- [x] Platform `5/5`, Web `72/72`, full typecheck/lint/test/build and boundary checks pass; Terra review is READY.
- [x] No UI, schema, migration, provider config, live payment, or real AI changes.
- [x] GitHub PR #74 merged as `767e742`; required CI and the Vercel bot automatic deployment succeeded. The stable shared test URL returned `200`, while the SSO-protected unique deployment URL returned `302`.
- [x] No manual deployment, online database mutation/migration, live Provider call, or Provider configuration operation was performed.

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

2026-07-08 GNE-262 CAPABILITY audit implementation:

- `public.audit_events` is added as the durable CAP-02 audit store with RLS and
  owner-only read policy.
- CatCare uses a product-local Audit facade at
  `apps/web/lib/catcare/product-service/audit.ts`; common-foundation uplift is
  the shared event shape around actor, owner/resource/token scope,
  `correlation_id`, and `idempotency_key`, not a generic share-token package.
- Covered actions: plan publish, share link create/regenerate, share revoke,
  valid anonymous share page view, invalid/expired/revoked/unavailable token
  rejection, and anonymous submission create/update.
- Owner-visible activity is shown on the care-plan detail page as
  "分享与安全记录" with product-language summaries. It does not expose raw token,
  token hash, internal ids, owner email, full notes, or private handoff text.
- Bearer-link copy is explicit: anyone with a valid link can view authorized
  care info and submit results; regenerate revokes old links while preserving
  already submitted results.
- Non-goals preserved: no Outbox, AI, Billing/Credit, PostHog runtime, logged-in
  sitter identity, photo proof, or multi-user ACL.

2026-07-08 GNE-263 CAPABILITY outbox implementation:

- `public.outbox_events` is added as the durable CAP-03 outbox store with RLS
  and owner-only read policy.
- CatCare uses a product-local Outbox facade at
  `apps/web/lib/catcare/product-service/outbox.ts`; common-foundation uplift is
  the shared envelope around aggregate type/id, status, attempt count,
  `correlation_id`, `idempotency_key`, and redacted payload.
- `idempotency_key` has a unique index and Outbox writes use upsert so repeated
  anonymous task updates refresh the pending notification instead of creating
  duplicate queued work.
- `apps/web/lib/catcare/product-service/share-tokens.ts` no longer owns
  anonymous submission mutation. Submission handling is split into
  `anonymous-submissions.ts` before adding Outbox records.
- Covered action: anonymous submission create/update records a pending
  `owner_notification` outbox item after the business submission succeeds.
- Outbox payload does not expose raw token, token hash, owner email, full notes,
  or private handoff text.
- Non-goals preserved: no real email/message worker, no generic share-token
  package, no PostHog runtime correlation, and no Outbox admin UI.

2026-07-08 GNE-264 CAPABILITY AI recap implementation:

- The owner result detail page exposes "生成复盘草稿" in the intelligent recap
  panel and keeps real submission/result rendering as the source of truth.
- CatCare builds the AI request from `PlanResultSummary` only: completion
  counts, overdue entries, and attention entries. Raw sitter notes, private
  handoff text, raw share tokens, token hashes, owner email, and debug ids are
  excluded from prompt construction and capability metadata.
- The server action calls the shared AI service boundary, so provider mode,
  entitlement/credit gating, usage record status, and analytics-safe metadata
  remain behind the common capability contract.
- Usage metadata is allowlisted to `correlation_id`, `resource_id`,
  `resource_type`, and `request_source` so reviewer evidence can trace the
  owner plan action without storing raw prompt text or sitter notes.
- The UI shows mock/no-op/sandbox mode, successful draft output, failed state,
  and blocked state with links to the usage page and sandbox credit-pack
  checkout.
- Non-goals preserved: no live AI provider quality guarantee, no real payment
  checkout work, no new anonymous share behavior, and no generic share-token
  extraction.

2026-07-10 GNE-264 completion checkpoint:

- AI-assisted plan generation and owner result recap both consume the shared
  entitlement/credit gate; successful generation records usage and invalidates
  the owner-scoped Billing entitlement cache tag.
- The result page now reads the same server-side entitlement snapshot as the
  plan page. Zero remaining uses disables only generation/regeneration, shows
  the CatCare paywall actions immediately, and keeps an existing recap readable.
- A pure availability rule covers published, draft, closed, and quota-exhausted
  states. Regression tests prove quota exhaustion blocks generation while a
  published plan with remaining uses stays available.
- Successful plan/recap actions invalidate the CatCare, Account, Billing, and
  Usage server paths; the current result route uses `router.refresh()` only, so
  this is targeted server-cache refresh rather than a browser-wide reload.
- Authenticated browser acceptance opened the owner plan list, entered an
  existing result, read its persisted recap, and returned to the result list.
  Desktop 1440x800 and mobile 390x844 showed no horizontal overflow. Evidence:
  `/private/tmp/gne264-results-desktop-1440.png` and
  `/private/tmp/gne264-results-mobile-390.png`.

2026-07-08 GNE-265 CAPABILITY Billing/Credit return-flow implementation:

- CatCare AI recap blocked state now links to `/account/usage` with a safe
  CatCare `return_to` context and can start the sandbox AI credit-pack checkout
  from the original plan result page.
- `/account/usage` renders a CatCare-specific Paywall panel only when
  `return_to` is a safe `/catcare` path, with actions to buy the sandbox
  credit pack or return to the original plan.
- Payment checkout/result return URLs allow exact `/account` and `/catcare`
  path scopes only; external URLs, protocol URLs, double-slash URLs, and
  prefix-confusion paths stay rejected.
- Sandbox checkout success/cancel/failure continues to write trusted Billing
  facts through the protected server action and then returns to the original
  CatCare context with `payment_result` and `price_id` query markers.
- Non-goals preserved: no live payment, no invoice/refund/proration flow, no
  client-derived entitlement, and no PostHog-as-billing-source behavior.

2026-07-10 GNE-265 completion checkpoint:

- Payment/checkout return validation is centralized in the internal return
  helper and accepts only exact `/account` and `/catcare` route roots.
- CatCare Billing presentation is split into the 343-line overview composer,
  a local plan-comparison section, and a local records section. Shared Billing
  facts remain in the server service; no generic cross-product Billing UI was
  introduced.
- The linked online test database returned readable Billing entitlement,
  usage, and credit-ledger surfaces. Sampled AI entitlement and usage rows use
  `credit` units and are stored in 10000-credit blocks, matching one product use.
- The sandbox return UI continues to return to the originating CatCare route;
  live payment, refunds, invoices, and production Creem charging remain out of
  scope.
- Authenticated Billing acceptance passed at 1440x800 and 390x844 without
  horizontal overflow. Evidence:
  `/private/tmp/gne265-billing-desktop-1440.png` and
  `/private/tmp/gne265-billing-mobile-390.png`.
- The AI top-up action completed in Creem Test Mode and returned to the
  originating CatCare result route with a success notice. The resulting test
  order `2c64812f-b5ab-490c-8eae-f439f688f341` is `paid` for 900 cents and has
  one active 100000-credit entitlement plus one 100000-credit grant ledger.
- Replaying the successful checkout result for the CatCare return path kept
  exactly one entitlement and one grant ledger for that order, proving the
  payment return is idempotent. Evidence:
  `/private/tmp/gne265-catcare-return-desktop-1440.png`.

2026-07-08 GNE-261 CAPABILITY action map:

- `specs/reference-product/capability-action-map.md` is the CAP-01 source for
  mapping business actions to Audit, Outbox, Billing/Credit, AI, PostHog, and
  permission boundaries.
- The map classifies each action with `common_contract_verified`,
  `common_pattern_not_extracted`, `product_foundation`, `catcare_specific`, or
  `not_run` so later CAP issues can improve the common foundation without
  moving CatCare business objects into `packages/*`.
- Common-foundation handoff is explicit: capability calls should carry actor,
  owner scope, anonymous token scope, resource scope, `correlation_id`, and
  `idempotency_key`.
- Cloudflare/Hono portability is preserved as a requirement: app-layer
  owner/token/resource filters must remain correct even if a future store does
  not enforce Supabase RLS.
- GNE-261 is documentation and architecture acceptance only. Runtime Audit,
  Outbox, AI, Billing/Credit, PostHog, and reliability implementation remains
  owned by GNE-262 through GNE-267.

2026-07-08 GNE-260 ACCESS security negative matrix:

- `specs/reference-product/access-security-negative-matrix.md` is the ACCESS-06
  source for negative scenarios and audit requirements.
- Covered negative scenarios: cross-owner access, share-token create/revoke
  abuse, expired/revoked/tampered tokens, repeated link generation, duplicate
  submit, forwarded-link minimum scope, direct anonymous DB read/write, direct
  submit validation, and raw-token leakage checks.
- Audit is intentionally contract-only here. CAP-02 owns durable audit storage;
  GNE-260 defines required event names, allowed fields, and forbidden fields.
- Common-foundation judgment: token gate, anonymous actor context, field
  whitelist, idempotency, and the matrix are reusable security patterns; CatCare
  business table fields remain product-specific; audit persistence is `not_run`.
- Cloudflare/Hono portability has a recorded risk list: preserve owner/token
  repository filters without RLS, propagate `correlation_id`, and implement safe
  audit payload redaction in CAP-02.

2026-07-08 GNE-232 parent final smoke:

- Local `http://localhost:3003` was started outside the sandbox after sandbox
  port binding blocked `next dev`.
- Desktop `1440px` smoke passed for `/catcare`, `/catcare/plans`,
  `/catcare/results`, and `/catcare/plans/3c3ec881-fc2d-4b32-b3f1-d15866347d78`:
  pages rendered authenticated owner content with no horizontal overflow.
- Mobile `390px` smoke passed for valid anonymous
  `/s/[redacted-valid-token]` and invalid
  `/s/invalid-token-smoke`: both rendered Chinese ACCESS copy with no horizontal
  overflow; invalid token showed no care content.
- Anonymous submit smoke submitted one current-day task. The visible visit
  progress changed from `0/4` to `1/4`, the submitted task changed to
  `已提交完成`, and the submit button disappeared for that task after reload.
- Owner result smoke showed `/catcare/results` increasing the active plan count
  from `16 条提交待查看` to `17 条提交待查看`; plan result detail showed completion
  overview, pending reminder, notes summary, and `返回结果查看`.
- Screenshot evidence:
  `/private/tmp/gne232-final-results-desktop-1440.png` and
  `/private/tmp/gne232-final-anon-valid-390.png`.
- Revoke and expired-token clicks were not executed in this smoke to avoid
  invalidating the user's active share link. Those destructive states remain
  covered by GNE-257/GNE-259/GNE-260 token/RLS evidence.

2026-07-08 GNE-259 owner/anonymous access boundary:

- Owner-only boundary is covered by rollback-only SQL against `cats`,
  `care_plans`, `care_tasks`, `care_submissions`, and `share_tokens`: Owner A
  can read own rows and cannot read or mutate Owner B rows.
- Anonymous database role cannot directly read private CatCare tables or the
  share-token table and cannot directly write share-token or submission rows.
- Anonymous app access remains token-scoped: valid `/s/[token]` access resolves
  a token into an anonymous scope and then reads/writes only through derived
  `ownerId`, `resourceId`, task, service-date, and visit-time conditions.
- Current ACCESS security model is not purely RLS-dependent; service-layer
  owner/token conditions are documented as the minimum portability boundary for
  a future no-RLS store.

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

2026-07-08 GNE-258 link regeneration acceptance:

- Regenerating a share link revokes the old entrance but does not delete,
  hide, or reset existing `care_submissions`.
- New share links must show already submitted task slots for the same
  plan/date/visit/task and must not permit duplicate writes for those slots.
- Legacy token-scoped anonymous submissions remain readable and updatable
  through the plan/date/visit/task duplicate boundary.

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

## GNE-266 Foundation Hardening Acceptance

- Shared correlation/capability context is owned by the runtime-agnostic
  `@xwlc/platform` public entry, exposes exactly four external metadata keys,
  and rejects URL, whitespace/private text, oversized, and bearer-like values.
- Shared Analytics transport accepts bounded safe primitives and contains no
  CatCare event union or CatCare field allowlist. CatCare owns its event adapter;
  a Travel adapter can add events without changing CatCare or the transport.
- Analytics URLs remove all query/hash data and redact high-entropy or
  known-secret path segments without depending on route names; `/s`, `/share`,
  `/invite`, and `/public-link` are covered while normal UUID resources remain.
- PostHog server capture uses the documented single-event `/i/v0/e/` endpoint
  with `api_key`, `distinct_id`, and `event` at the request-body top level.
- `@xwlc/platform` owns only generic anonymous share-credential actor and
  valid/expired/revoked/invalid/unavailable state resolution. CatCare DTOs,
  persistence rows, raw secrets, and Node crypto remain in the app layer.
- No schema, migration, or UI behavior changes are introduced.
