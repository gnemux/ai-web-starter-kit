# CatCare Parallel Handoff

Last updated: 2026-07-03

Linear mirror:
https://linear.app/gnemux/document/catcare-product-并行推进交接gne-280-后-92ccd8117db2

## Current State

MVP3 is validating the Reference Product path through a real CatCare product,
not a starter demo reskin.

Completed under `GNE-231 PRODUCT`:

- `GNE-278 PRODUCT-00`: page map, flow, pricing trigger points, and the
  canonical 13-screen V6 split prototype set.
- `GNE-280 PRODUCT-01`: CatCare UI/SYSTEM baseline for Landing, Login,
  Dashboard, Billing, Usage, product shell, and product-owned icon/assets.
- `GNE-251 PRODUCT-02`: CatCare product data model for cats, routines, items,
  events, plans, tasks, and submissions.

Next PRODUCT work:

- `GNE-252 PRODUCT-03`: owner create/edit/publish flow.
- `GNE-288 PRODUCT-04`: CatCare service split and local-update boundary cleanup.
- `GNE-253 PRODUCT-05`: owner results and state changes.
- `GNE-254 PRODUCT-06`: Supabase RLS acceptance SQL and seed data.
- `GNE-255 PRODUCT-07`: page analytics and page-level acceptance.

ACCESS (`GNE-232`) and CAPABILITY (`GNE-233`) are still Backlog. They can do
contract/spec work in parallel, but implementation must not outrun PRODUCT
facts.

## Can Three Threads Run In Parallel?

Yes, but only with file ownership and scope locks. Three threads must not all
edit the shared CatCare shell, shared icon components, i18n dictionaries, and
account pages at the same time.

Recommended safe split:

1. Thread A: `GNE-252 PRODUCT-03` owner flow implementation.
2. Thread B: `GNE-253 PRODUCT-05` owner results skeleton and status model, using
   seed/mock owner-visible submissions until ACCESS produces real anonymous
   submissions.
3. Thread C: `GNE-254/GNE-255` acceptance work: seed/RLS evidence, page smoke,
   screenshots, and PostHog page-event contract.

Spec-first parallel split, if faster planning is needed:

1. PRODUCT implementation thread: `GNE-252`.
2. ACCESS contract thread: `GNE-256` and `GNE-279` token/link lifecycle spec,
   no public token implementation until PRODUCT publish contract is stable.
3. CAPABILITY contract thread: `GNE-261` business-action capability map, no
   live AI/payment implementation until owner result/paywall actions exist.

Do not run full implementation of PRODUCT, ACCESS, and CAPABILITY at the same
time before contracts are frozen. That would create false dependencies around
share tokens, AI credit gates, and business state transitions.

## Thread Ownership

### Thread A: PRODUCT Owner Flow (`GNE-252`)

Goal:

Build the owner path from empty account to published plan inside the CatCare
product shell.

Primary routes:

- `/catcare/cats`
- `/catcare/routines`
- `/catcare/items`
- `/catcare/events`
- `/catcare/plans`
- `/catcare/plans/[id]`

Expected flow:

`Landing/Login -> /catcare -> cat profile -> routine -> optional items/events
-> scenario/planning inputs -> AI/mock checklist review -> publish plan`.

Allowed files:

- `apps/web/app/catcare/**`
- `apps/web/lib/catcare/**`
- `apps/web/components/catcare-ui.tsx` only for product-layer reusable CatCare
  UI patterns needed by this flow.
- Tests and specs directly covering PRODUCT owner pages.

Do not:

- Add `share_tokens` or anonymous token tables.
- Implement `/s/[token]`.
- Wire live AI, live payment, or entitlement deduction.
- Put cat/routine/plan business objects into `packages/*`.
- Replace the GNE-280 shell or icon system unless the issue explicitly requires
  a product-wide UI fix.

### Thread B: PRODUCT Results (`GNE-253`)

Goal:

Make owner-visible results and state changes coherent before ACCESS produces
real sitter submissions.

Primary routes:

- `/catcare/results`
- `/catcare/plans/[id]/results`

Allowed input:

- Existing `care_submissions` table from `GNE-251`.
- Seed/mock owner-visible submissions for UI and state verification.

Must expose:

- Empty results.
- Pending submission.
- Received submission.
- Abnormal submission.
- AI review/paywall entry as a visible future capability slot only.

Do not:

- Implement anonymous submit.
- Treat AI result as business fact.
- Deduct credits.
- Create order/entitlement side effects.

### Thread C: PRODUCT Acceptance (`GNE-254/GNE-255`)

Goal:

Make PRODUCT work reviewer-verifiable and observable without taking over APP
implementation.

Primary outputs:

- Supabase seed and RLS acceptance SQL for owner-only CatCare tables.
- Page-level smoke and screenshot acceptance for key CatCare routes.
- Product page events only, not cross-capability correlation.

Allowed files:

- `supabase/migrations/**` only when the relevant PRODUCT data contract requires
  it.
- Test/acceptance scripts and docs.
- `specs/reference-product/**` acceptance updates.

Do not:

- Add ACCESS token behavior.
- Add Audit/Outbox/AI/Billing implementation; those are CAPABILITY.
- Use PostHog as a business source of truth.

## Prototype-To-Page Practice

Canonical visual source:

- `specs/reference-product/prototypes/v6-regenerated-normalized/`
- `specs/reference-product/gne-278-product-flow.md`
- `specs/reference-product/catcare-ui-guidelines.md`

Implementation rule:

Prototype images define layout intent, hierarchy, color, spacing, product
quality, and icon/illustration direction. Text, routes, pricing, and business
states must still be checked against Markdown specs and Linear issue bodies.
CatCare UI implementation details such as controls, buttons, tags, destructive
actions, and family-item semantics must follow `catcare-ui-guidelines.md`.

Use this conversion order:

1. Identify the target prototype screen and the route it maps to.
2. Split page structure into shell, page section, repeated cards, controls, and
   state components.
3. Reuse existing CatCare product components before adding new ones.
4. Put CatCare-specific components/assets in app/product layer.
5. Only promote a component to `packages/*` when it has no CatCare semantics and
   is clearly reusable across future products.
6. Screenshot at `1470x798`, `1366x768`, `1440x900`, and `1920x1080`.
7. Check no horizontal overflow, no clipped content, no engineering/Demo words,
   no fake capability claims.

## Product Interaction And Data Practice

GNE-252 exposed a product-quality rule: CatCare is an editing workflow, not a
static review page. Same-page owner operations must feel local.

Use this rule for PRODUCT pages:

1. If the user stays on the same page, prefer a local server action returning
   structured data, update local UI state, and show the CatCare toast.
2. If the operation creates a new workflow destination, such as first creating a
   care plan and opening its detail page, `redirect()` is acceptable.
3. If a mutation changes multiple owner-level facts, invalidate the smallest
   relevant CatCare cache. Do not call broad revalidation as the default.
4. Do not query Supabase in per-card/per-task loops. Batch by owner, cat, plan,
   or item ids before composing page data.
5. Toasts, destructive confirmations, and temporary success/error feedback are
   product-level surfaces. They must not be mounted inside a card that may
   unmount during the same mutation.
6. Cached entitlement/quota reads are allowed in CatCare shell because plan and
   quota rarely change during one editing session.

Current product-level implementation anchors:

- Product actions: `apps/web/app/catcare/actions.ts`
- Product toast: `apps/web/app/catcare/catcare-toast.tsx`
- Product UI controls: `apps/web/app/catcare/owner-flow-components.tsx`
- CatCare service/cache boundary: `apps/web/lib/catcare/product-service.ts`

Do not promote these to `packages/*` during GNE-252. Promote only after a second
product needs the same behavior without CatCare semantics.

## Code Structure Follow-Up

The current GNE-252 implementation is acceptable for owner-flow acceptance, but
the CatCare service boundary is now large enough that MVP3 should not continue
adding unrelated responsibilities to one file.

Recommended issue timing:

- Do not hide this split inside a UI fix or a late bug-fix patch.
- Create or assign a dedicated MVP3 PRODUCT architecture follow-up immediately
  after `GNE-252` owner-flow acceptance.
- Complete it before `GNE-253` results expansion, `GNE-232` ACCESS share-link
  implementation, or `GNE-233` CAPABILITY AI/Billing gates add more CatCare
  branches.

Split `apps/web/lib/catcare/product-service.ts` by domain:

- `cats`: profile CRUD and cat summaries.
- `routines`: reusable feeding/care habits and routine-to-item sync.
- `items`: owner item library, assignments, product catalog lookup.
- `events`: care/event records and item links.
- `plans`: care plan lifecycle, tasks, publish/close/delete, results.
- `catalog-cache`: product dictionaries, owner-level cache helpers, cache
  invalidation.

Keep this as a deliberate refactor issue, not a drive-by change inside a UI
fix. The split should preserve the existing app/product boundary and should not
move CatCare business types into shared packages.

## Icon And Asset Practice

Current accepted icon baseline:

- Source PNG crops live in `apps/web/public/catcare/icons/prototype/`.
- Frontend SVGs live in `apps/web/public/catcare/icons/traced/`.
- React wrappers live in `apps/web/components/catcare-icons.tsx`.
- Spec lives in `apps/web/public/catcare/icons/icon-spec.md`.
- Inventory lives in `apps/web/public/catcare/icons/inventory.md`.

Rules learned from `GNE-280`:

- Do not hand-draw replacement SVGs first when a prototype/source crop exists.
- Use semantic names such as `cat-profile`, `feeding-routine`, `care-events`,
  `ai-checklist`, `share-link`, `billing-entitlements`, and `ai-credit`.
- Use prototype/source crop -> normalized PNG -> `potrace` fill SVG -> wrapper.
- The accepted baseline is the unthinned prototype PNG -> `potrace` SVG output.
- Whole-card crops are unsafe when they include text, borders, selected fills,
  or clipped cats. Normalize illustrations into same-size product assets first.
- Active/hover/disabled states belong to wrappers, not random asset variants.
- Shared packages must not import CatCare icon files.

## Shared Files Lock

Only one thread should own these files at a time:

- `apps/web/app/catcare/catcare-shell.tsx`
- `apps/web/components/catcare-ui.tsx`
- `apps/web/components/catcare-icons.tsx`
- `apps/web/components/catcare-brand.tsx`
- `apps/web/app/account/catcare-billing-overview.tsx`
- `apps/web/public/catcare/**`
- CatCare i18n dictionaries, if touched by a future change.
- `apps/web/lib/catcare/product-service.ts`, until it is deliberately split.
- `apps/web/app/catcare/actions.ts`, because local action vs route-transition
  action behavior affects perceived performance.

If another thread needs one of these files, it should first state the exact
reason and expected diff shape.

## Non-Negotiable Boundaries

- Keep package boundary clean.
- Do not move CatCare business objects into `packages/*`.
- Do not create Cloudflare/Hono adapter work early.
- Do not repeat MVP1/MVP2 demo deployment verification.
- Keep `/demo`, `/demo/login`, `/dashboard`, and `/demo/account*` available as
  foundation demo surfaces unless an issue explicitly retires them.
- Keep `/catcare` as the product route. `/reference-product*` is compatibility
  only.
- ACCESS owns private share token generation, hash storage, expiry, revoke,
  replay, anonymous visibility, and anonymous write whitelist.
- CAPABILITY owns Audit, Outbox, AI, Billing/Credit, Entitlement, Paywall,
  PostHog cross-capability correlation, failure/retry/idempotency.

## Required Checks Per PR

Run at minimum:

```text
pnpm typecheck
pnpm lint
pnpm test:package-boundaries
pnpm test:release-boundaries
git diff --check
```

For UI-affecting PRODUCT work, also provide local screenshot/smoke evidence for
the touched routes and at least the main CatCare entry route.

For CatCare data-flow or same-page mutation work, also verify at least one
create, one edit, and one delete path in the browser. The expected behavior is:
no white screen, no full workspace refresh, visible toast, and updated local
state.

## Recommended Next Thread Prompts

Thread A prompt:

```text
Read context/project.md, context/linear.md, context/catcare-parallel-handoff.md,
specs/reference-product/gne-278-product-flow.md, and GNE-252 in Linear. Work
only on PRODUCT-03 owner create/edit/publish flow. Do not implement ACCESS,
AI, payment, or package changes unless the issue explicitly requires it.
```

Thread B prompt:

```text
Read context/project.md, context/linear.md, context/catcare-parallel-handoff.md,
specs/reference-product/gne-278-product-flow.md, and GNE-253 in Linear. Build
owner results/status surfaces using owner-visible seed/mock submissions only.
Do not implement anonymous submit, AI generation, or credit deduction.
```

Thread C prompt:

```text
Read context/project.md, context/linear.md, context/catcare-parallel-handoff.md,
specs/reference-product/engineering-spec.md, and GNE-254/GNE-255 in Linear.
Prepare PRODUCT seed/RLS/page-event acceptance evidence. Do not add ACCESS,
Audit, Outbox, AI, or Billing implementation.
```
