# Product Spec: MVP3 Reference Product

## Summary

The Reference Product is a small cat temporary-care product used to prove that a real product can consume the XWLC foundation through public packages while keeping product objects in the app/product layer. GNE-231 owns the product-facing homepage, login context, owner-side workspace, and minimum business loop; ACCESS and CAPABILITY wire anonymous sharing, AI, Billing, Credit, Audit, Outbox, and analytics later.

GNE-278 is the PRODUCT-00 design gate for this flow. The detailed page map,
prototype review, state matrix, routine/event/checklist model, share-link state
machine, paid-user surfaces, USD pricing standard, and capability handoff live
in `specs/reference-product/gne-278-product-flow.md`.

The current visual reference is the regenerated split-screen set at
`specs/reference-product/prototypes/v6-regenerated-normalized/`. These assets
guide layout, hierarchy, and route mapping; implementation must still check
exact product behavior, text, and state boundaries against
`specs/reference-product/gne-278-product-flow.md`.

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
-> /catcare owner dashboard
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
-> /catcare owner dashboard
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
- `/login`: CatCare login/signup shell, defaulting to `/catcare`.
- `/catcare`: protected CatCare owner workspace.
- `/reference-product`: legacy MVP3 engineering URL, redirects to `/catcare`.
- `/catcare/cats`, `/catcare/cats/new`, `/catcare/cats/[id]`: CatCare cat profile surfaces.
- `/catcare/routines`, `/catcare/routines/[cat_id]`: reusable daily care routine surfaces.
- `/catcare/items`: food, treats, medicine, litter, and care item inventory.
- `/catcare/events`, `/catcare/events/new`: lightweight event and health timeline.
- `/catcare/plans`, `/catcare/plans/new`, `/catcare/plans/[id]`: generated temporary checklist surfaces.
- `/catcare/plans/[id]/results`: owner result and AI/paywall entry surface.
- `/demo`: foundation demo entry for reviewing starter-kit capabilities.
- `/demo/login`: foundation demo login shell, defaulting to `/dashboard`.
- `/dashboard`: protected foundation demo workspace.
- `/account`, `/account/billing`, `/account/usage`: shared account, plan/payment, and AI Credit surfaces used by the product in CatCare context.
- `/s/[token]`: future anonymous sitter surface owned by ACCESS.

## Requirements

- `/catcare` is protected and preserves login return context.
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

## GNE-318 Account Recovery

CatCare must provide a complete password-recovery path from the existing login
surface. A signed-out owner can request a reset email without revealing whether
the address is registered. A valid recovery email first opens a first-party
confirmation page without consuming the one-time credential. Only an explicit
user click establishes the Supabase recovery session and opens a protected
new-password form in a neutral pre-login Auth shell; a URL parameter or an email
scanner GET alone must never authorize a password change. The recovery form is
not presented as a signed-in CatCare account page, while the normal account
settings route remains available to an already signed-in owner.

The reset-request view keeps the original safe CatCare/account return path.
Expired, invalid, already-used, rate-limited, and provider-failed requests show
recoverable product-language states and a path to request a new email. A normal
authenticated owner may change their own password because Supabase already
authorizes that account session; anonymous or URL-only requests cannot.
Choosing the existing password produces a specific localized field message and
does not falsely tell the owner that the recovery link failed.

The recovery credential stays in the browser URL fragment until the
confirmation page moves it into an explicit POST and immediately clears the
fragment. The Analytics SDK is not initialized on that sensitive page. This
work does not add SMS recovery, MFA, social login,
administrator password changes, a custom email provider, or a database
migration. It must not log or emit email addresses, passwords, OTPs, recovery
codes, token hashes, or reset URLs.

## GNE-319 Private Care Media

CatCare owners may mark an individual plan task as requiring photo evidence.
The requirement follows every scheduled visit for that task and is visible in
the owner editor, published plan, schedule, and anonymous sitter page. A normal
completion cannot be submitted without selecting at least one photo when the
owner enabled this requirement. The server receives and validates the real
selected files and does not trust a client-provided photo count. An exception
report is different: it must be
saved immediately with its required note even when the camera, image upload, or
network is unavailable, and the sitter is prompted to add photos afterward.

The sitter can select, locally preview, remove, and retry up to three JPG, PNG,
or WebP images per submitted task. Each input is limited to 4 MB. Text status is
committed first and each photo uploads independently, so one failed image does
not lose the care result or repeat the Audit/Outbox side effects. The page shows
only the attachment count after upload; it does not expose stored object URLs
or allow an anonymous visitor to read back private evidence.

The owner sees lazy-loaded evidence thumbnails beside the matching real
submission and can open or download the safety-processed copy only while
authenticated as that owner. There is no public bucket URL. Stored evidence is
retained with the submission and immutable plan history; failed application
writes clean up their just-uploaded object, while a future governed data-purge
workflow owns physical deletion of retained history.

Runtime CatCare raster assets use compressed WebP delivery. Owner cat-profile
uploads and sitter evidence are decoded and re-encoded server-side to bound
dimensions and size and remove EXIF, GPS, XMP, and other source metadata. This
conversion preserves existing cat profiles that stored the former built-in PNG
illustration paths by resolving them to their new WebP equivalents. This
issue does not add video, arbitrary documents, public galleries, image editing,
face recognition, or a generic cross-product media platform.
