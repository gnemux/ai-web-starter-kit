# Product Spec: MVP3 Reference Product

## Summary

The Reference Product is a small cat temporary-care product used to prove that a real product can consume the XWLC foundation through public packages while keeping product objects in the app/product layer. GNE-231 owns the product-facing homepage, login context, owner-side workspace, and minimum business loop; ACCESS and CAPABILITY wire anonymous sharing, AI, Billing, Credit, Audit, Outbox, and analytics later.

GNE-278 is the PRODUCT-00 design gate for this flow. The detailed page map,
prototype review, state matrix, routine/event/checklist model, share-link state
machine, paid-user surfaces, USD pricing standard, and capability handoff live
in `specs/reference-product/gne-278-product-flow.md`.

The current visual reference is
`specs/reference-product/prototypes/catcare-gne-278-flow-board-v6.png`.

## User

- Primary user: a cat owner who prepares temporary-care instructions.
- Secondary user: a reviewer validating the product path and package boundary.
- Future user: an anonymous sitter who receives a private link and submits care results under GNE-232.

## Problem

The project needs a concrete product surface, not only platform scaffolding, so reviewers can see whether Auth, data, packages, account, billing, payment, and AI Credit can serve a real product without leaking product domain objects into reusable packages.

## Goals

- Replace generic starter first-screen and login copy with CatCare product entry points.
- Preserve the foundation demo under `/demo`, `/demo/login`, and `/dashboard` without copying Auth logic.
- Let a signed-in owner create a cat profile from a product-shaped route.
- Let the owner set a reusable daily care routine.
- Let the owner record lightweight daily events and food/treat/care items that
  improve generated checklists.
- Let the owner generate a temporary care checklist from the cat profile,
  routine, and scenario instead of manually entering every task.
- Let the owner view care-plan state, tasks, result slots, and future share/AI/paywall entry points.
- Show product-side account, billing/payment, and AI Credit entry points without implementing GNE-233 capability wiring early.
- Keep product domain names out of `packages/*`.
- Record daily events in a way that can later support paid text/video recap
  generation, without making that recap a required MVP3 capability.

## Non-goals

- Anonymous share-token lifecycle, sitter access, and public submissions; these belong to GNE-232.
- Product-specific entitlement checks, payment actions, AI Credit consumption, AI drafts, Audit, Outbox, and PostHog correlation; these belong to GNE-233.
- Cloudflare or Hono adapters; MVP3 preserves adapter readiness only.
- Live payment, real-provider AI, production Supabase, barcode lookup, package
  OCR, regional pricing, tax/invoice/refund/settlement handling, or MVP1/MVP2
  deployment repetition.
- Text/video recap generation and social publishing to Moments, Xiaohongshu,
  Douyin, X, YouTube, or similar platforms. This is a valid future monetization
  candidate, but MVP3 only records enough daily-event structure to keep the
  option open.

## User Journey

First-run activation path:

```text
/ product landing
-> /login
-> /reference-product owner dashboard
-> create cat profile
-> set reusable daily care routine
-> choose temporary-care scenario and dates
-> generate temporary care checklist
-> review/edit/publish checklist
-> GNE-232 private link and anonymous sitter submit
-> owner results
-> GNE-233 AI review / paywall / sandbox checkout
```

Full product loop:

```text
/ product landing
-> /login
-> /reference-product owner dashboard
-> create cat profile
-> set reusable daily care routine
-> optionally maintain food/care items and daily event history
-> choose temporary-care scenario and dates
-> generate temporary care checklist
-> review/edit/publish checklist
-> GNE-232 private link and anonymous sitter submit
-> owner results
-> GNE-233 AI review / paywall / sandbox checkout
-> order / entitlement / credit update
-> return to original plan results
```

The first-run path must not require food/care items or event history. Those
objects improve checklist quality and retention, but requiring them before the
first generated checklist delays the pay point and creates avoidable activation
drop-off.

## Route Map

- `/`: CatCare product homepage.
- `/login`: CatCare login/signup shell, defaulting to `/reference-product`.
- `/reference-product`: protected CatCare owner workspace.
- `/reference-product/cats`, `/reference-product/cats/new`, `/reference-product/cats/[id]`: CatCare cat profile surfaces.
- `/reference-product/routines`, `/reference-product/routines/[cat_id]`: reusable daily care routine surfaces.
- `/reference-product/items`: food, treats, medicine, litter, and care item inventory.
- `/reference-product/events`, `/reference-product/events/new`: lightweight event and health timeline.
- `/reference-product/plans`, `/reference-product/plans/new`, `/reference-product/plans/[id]`: generated temporary checklist surfaces.
- `/reference-product/plans/[id]/results`: owner result and AI/paywall entry surface.
- `/demo`: foundation demo entry for reviewing starter-kit capabilities.
- `/demo/login`: foundation demo login shell, defaulting to `/dashboard`.
- `/dashboard`: protected foundation demo workspace.
- `/account`, `/account/billing`, `/account/usage`: shared account, plan/payment, and AI Credit surfaces used by the product in CatCare context.
- `/s/[token]`: future anonymous sitter surface owned by ACCESS.

## Requirements

- `/reference-product` is protected and preserves login return context.
- PRODUCT data-model verification happens inside the CatCare product shell:
  Landing, login/register, authenticated default workspace, and
  account/billing/usage entries must already be product-context pages.
- `/demo` and `/demo/login` keep the old foundation demo reachable without making it the Reference Product entry.
- Product data is owner-scoped by Supabase RLS.
- Owner-side UI has clear empty, form, saved, published, and service-error states.
- Account, billing/payment, and AI Credit are visible as product capability slots, with current links to the shared account surfaces.
- Copy must make clear that deep product-specific wiring is deferred to GNE-233.
- The foundation demo remains reachable through `/demo`, `/demo/login`, and `/dashboard`, but it is not the Reference Product's primary first screen.

## Edge States

- Empty: no cats and no care plans.
- Active dashboard: at least one cat and one plan.
- Loading: server-rendered page and Server Action pending states.
- Error: service-level error surface when Auth, Supabase, or RLS access fails.
- Permission denied: protected route redirects unauthenticated users to login.
- Anonymous boundary: expired, revoked, tampered, or duplicate-submit token states belong to ACCESS.
- Capability boundary: AI gated, AI failed, payment canceled, and payment success return states belong to CAPABILITY.
- Long content: notes and instructions are bounded to 2000 characters and displayed in contained panels.

## Success Metrics

- Activation: owner creates at least one cat profile and care plan.
- Retention: owner returns to review plan state.
- Conversion: GNE-233 later maps product billing/payment actions from the visible capability slots.
- Quality: package-boundary checks keep cat-care objects out of `packages/*`.
