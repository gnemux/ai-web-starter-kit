# CatCare UI Guidelines

Scope: CatCare product UI. These rules supplement the V6 normalized prototypes
and do not replace `apps/web/public/catcare/icons/icon-spec.md`.

## Source Of Truth

- Visual reference: `specs/reference-product/prototypes/v6-regenerated-normalized/`.
- Product flow: `specs/reference-product/gne-278-product-flow.md`.
- Icon production: `apps/web/public/catcare/icons/icon-spec.md`.
- Product UI lives in `apps/web/app/catcare/**` or `apps/web/components/catcare-ui.tsx`.
- Move code to `packages/*` only after another product needs the same behavior
  without CatCare semantics.

## Prototype-To-Page Workflow

1. Map the route to a V6 prototype screen.
2. Split the page into shell, section, repeated cards, controls, and states.
3. Reuse existing CatCare components before adding new ones.
4. Build the real workflow first screen, not explanatory demo cards.
5. Verify desktop screenshots and page smoke after UI-affecting changes.

## Layout And Cards

- Keep page sections unframed; use cards for repeated records, forms, and
  modals only.
- Do not nest cards inside cards.
- Align controls by shared grid tracks, field heights, and icon baselines.
- Use compact dashboard/tool typography inside panels; reserve hero type for
  true hero surfaces.
- Long labels, buttons, and tags must not resize or shift the surrounding grid.

## Controls

- CatCare form controls must use product styling; do not ship raw browser
  selects, date inputs, upload inputs, or datalists as the final surface.
- Text inputs, select-like controls, date controls, and autocomplete controls
  must share height, border, padding, focus ring, font size, and icon alignment.
- Dictionary fields such as breed, food, treat, canned food, probiotics, and
  supplies should use searchable autocomplete when the option set is large.
- Numeric fields must validate positive numeric input at the UI/service boundary.
- Chinese mode shows Chinese copy; English mode shows English copy. Do not mix
  language modes in product UI.

## Buttons And Icons

- Use an icon when the action has a familiar symbol: back, edit, save, upload,
  search, calendar, delete, add.
- Use text or icon+text for primary commands, submit actions, and destructive
  confirmations.
- Icon-only actions require `aria-label` and `title`.
- Destructive card actions use a lightweight icon entry point and a fixed,
  centered modal confirmation with explicit text; do not use card-local popovers
  for destructive confirmation.
- Functional action icons come from `apps/web/app/catcare/catcare-action-icons.tsx`.
- Product/navigation/flow icons follow `apps/web/public/catcare/icons/icon-spec.md`.

## Tags And Status

- Tags should carry the smallest useful label.
- Use position and color for state before adding explanatory text.
- In family items, a cat-name tag means that cat uses the item.
- Current selected cat: CatCare teal filled tag.
- Other cats: neutral outlined tag.
- Unassigned: light neutral/attention tag.
- Do not add duplicate state labels such as "current cat is using" when the cat
  name tag already communicates that state.

## CatCare Product Semantics

- Cat profiles are cat-level records.
- Family items are account-level assets.
- Cat item assignments are cat-name tags plus optional per-cat amount/frequency
  and instructions.
- Removing a cat tag must not delete the family item.
- Deleting a family item removes all cat tags and must require confirmation.
- Food products entered in recurring routine should sync into the family item
  library and tag the selected cat.
- Routine labels should not appear as long-term item tags; routine is a source,
  not the user's item-management state.

## Data And Interaction Performance

- In-page create, edit, delete, publish, close, and assignment changes should
  use local server actions plus local UI state updates. Do not force a full page
  reload when the user stays on the same product workspace.
- `redirect()` and broad `revalidatePath()` are acceptable for true route
  transitions such as creating the first plan and opening its detail page. They
  should not be the default for high-frequency edits.
- Mutations that change cached CatCare data must invalidate the smallest useful
  product cache: owner summaries, item library, routine source data, plan list,
  or the specific plan detail.
- Read paths that combine cats, routines, items, events, and plans should batch
  by owner/cat/plan instead of querying inside per-record loops.
- Toast feedback is a product feedback layer. It must not be owned by a card,
  row, or modal that may unmount during the same mutation.
- Saved/deleted/failed feedback should use one product toast surface and should
  remain visible without scrolling back to the page header.
- Account entitlement and quota reads may use short-lived server-side caching
  because they rarely change during a CatCare editing session.

## Asset Boundary

- Cat illustrations, breed dictionaries, food dictionaries, and CatCare item
  semantics stay in the app/product layer.
- Shared UI packages may own generic primitives such as Button, Badge,
  EmptyState, ErrorState, layout primitives, and non-product-specific form
  primitives.
- Shared packages must not import CatCare icons, CatCare assets, or CatCare
  business dictionaries.
- CatCare-only toast styling, action icons, autocomplete dictionaries, plan
  schedule heuristics, and item/routine semantics stay in the product layer
  until another product needs the same behavior without CatCare meaning.
- If a utility is promoted to `packages/*`, it must be product-agnostic and
  have a package-boundary test that prevents importing CatCare assets or routes.

## Code Structure Notes

- Page components own layout and interaction state.
- Same-page owner interactions should feel local. Tabs, filters, selected-cat
  switches, and bounded view toggles should preload or cache the current page's
  needed data, update local UI state, and sync the URL when useful without
  replacing the whole workspace.
- Same-page mutations should use local server actions, return structured data
  when the user remains in place, update the smallest local UI state, invalidate
  the smallest relevant CatCare cache, and show the product toast. Use
  `redirect()` only when the mutation intentionally opens a new workflow
  destination.
- `apps/web/app/catcare/actions.ts` owns server actions and should distinguish
  local in-page actions from route-transition actions.
- `apps/web/lib/catcare/product-service.ts` is a compatibility barrel, not the
  implementation body. New CatCare service work should enter the domain file
  under `apps/web/lib/catcare/product-service/`.
- Current domain split:
  `workspace.ts`, `cats.ts`, `routines.ts`, `items.ts`, `events.ts`, and
  `plans.ts` own owner-facing reads and mutations by product area.
- Shared product service types live in `product-service/types.ts`; select
  strings, cache TTLs, and default routine definitions live in
  `product-service/constants.ts`.
- `product-service/core.ts` is the internal shared helper layer for cache
  loaders, normalizers, mappers, analytics helpers, and cross-domain utilities.
  Do not add page-specific mutations there; add them to the relevant domain
  service and import shared helpers from `core.ts`.
- When a new feature needs data from multiple domains, prefer a small
  read-composition function in the relevant domain or `workspace.ts`; do not
  re-create a monolithic service file.
- Avoid adding a new abstraction only to prepare for a future product. Keep the
  product component local until there is a second real consumer.

## Self-Review Checklist

- Page maps to the intended prototype and product flow.
- Controls align horizontally and vertically.
- Icons share size, weight, and baseline inside one action group.
- Labels, buttons, and tags do not overflow on common desktop and mobile widths.
- Empty, saved, destructive, and error states are present where needed.
- The real business path works through Supabase/API boundaries.
- Same-page mutations do not white-screen or replace the whole workspace.
- Success and error feedback appears through the product toast layer.
- `/demo`, `/demo/login`, `/dashboard`, and `/demo/account*` remain unaffected.
