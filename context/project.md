# Project Context

## Goal

Build a reusable commercial Web product starter kit for fast idea validation.

The starter kit should help the team move from:

```text
idea collection
-> product specification
-> AI-assisted implementation
-> MVP deployment
-> analytics and payment validation
-> marketing iteration
```

## Non-goals

- Do not build a complex enterprise platform in the first version.
- Do not optimize for high concurrency before product demand is validated.
- Do not hard-code one payment, analytics, or auth provider into business logic.
- Do not let generated code drift away from specs and status documents.

## Product Capability Tracks

1. Foundation and AI rules
2. Product shell and reusable UI
3. Data model, migrations, and permissions
4. API service layer and business access boundaries
5. Authentication and user account
6. Payment, billing, and entitlement
7. Analytics and monitoring
8. Deployment and operations
9. Growth and marketing
10. Documentation and examples

## MVP Stage Plan

The project uses Linear milestones for stage view and parent issues for module ownership.

```text
MVP1 基础底座
-> runnable app, Supabase Auth/Data/API, Vercel deploy rules, and base PostHog events

MVP2 扩展底座
-> provider matrix, Billing, Payment sandbox/contract, AI service boundary, and analytics verification
-> sealed on GitHub as `v0.2.0`; MVP3 work starts from this baseline

MVP3 Reference Product：双底座架构与 Package 消费验证
-> use the cat temporary care-plan Reference Product to prove that product repos can consume the XWLC platform foundation through versioned packages instead of copying Starter Kit source
-> current execution parents are `GNE-228` through `GNE-234`: PLAN, PLATFORM, DELIVERY, PRODUCT, ACCESS, CAPABILITY, and VERIFY

Future Growth / Backlog
-> keep `GNE-75 FUTURE GROWTH-00` as a horizontal growth and feedback capability outside MVP3/MVP4/MVP5/MVP6 until a real product-growth decision reopens it

MVP4 海外/国内双模式真实 Provider 接入
-> turn MVP2 provider reservations into real overseas/china provider integrations and smoke paths
```

MVP2 is intentionally not a single giant implementation issue. `MVP2-KNOW-01` is a consensus document; execution remains under module parent issues such as `MVP2 INTEGRATIONS-00`, `MVP2 BILLING-00`, `MVP2 PAYMENT-00`, `MVP2 AI-00`, and `MVP1-MVP3 ANALYTICS-00`.

Commercial and AI work must not remain invisible infrastructure only. Billing,
Payment, AI, and MVP3 Reference Product issues need reviewer-facing surfaces so
a non-implementing teammate can verify the user journey from the app itself.

```text
Billing
-> current plan, Free/Plus/Pro differences, entitlement or credit state

Payment
-> pricing/billing entry, checkout start, success/cancel/failure result, order/subscription/entitlement status

AI
-> AI entry, prompt/input, entitlement gate, provider mode, result, usage/credit/quota state

MVP3 Reference Product
-> login/signup, cat profile creation, care-plan creation, private-link publish, anonymous sitter submission, owner result view, AI draft, entitlement/usage, Outbox/Audit, and PostHog evidence
```

If an execution issue only changes code, SQL, or docs and gives no page, status view, event proof, or reviewer checklist, it is not ready for human acceptance unless the parent issue explicitly marks it as a pure internal contract task.

## Team Collaboration

Each capability track should have:

- a Linear parent issue
- small child issues
- one owner or rotating owner
- a spec under `specs/`
- integration notes when external services are involved
- clear acceptance checks

## Default Assumptions

- The first user-facing product will be a Web SaaS / Web App.
- The first deploy target is Vercel.
- The first auth and database provider is Supabase.
- GitHub tag `v0.2.0` is the MVP2 sealed baseline. MVP3 planning and future implementation should continue from latest `main` at or after this tag, not from old PR branches.
- Current cloud Supabase is a reference/staging/test project for MVP1/MVP2/MVP3 validation. Do not treat it as production; production Supabase is not enabled during MVP3 and becomes an上线前 gate only when real users, live payment, real AI cost, or formal production data are introduced.
- Payment starts with a Sandbox Provider before real provider integration.
- Analytics starts with PostHog and keeps space for China-friendly providers.
- MVP3 should not be blocked by real Payment or real AI provider readiness. It uses sandbox/mock/no-op paths first, with product acceptance handled only after the Reference Product path is stable.
- MVP3 remains on the Supabase + Vercel mainline while preserving Cloudflare/Hono adapter readiness through runtime-agnostic package contracts. Do not implement Cloudflare/Hono in MVP3 unless a later decision explicitly creates an adapter spike.
- MVP3 uses the 4-package naming convention `@xwlc/core`, `@xwlc/ui`, `@xwlc/platform`, and `@xwlc/db`. Do not mix in a 5-package naming scheme during MVP3 unless a later v0.3.x decision explicitly splits packages.
- MVP3 execution starts with `GNE-228 / MVP3-01 PLAN`, then proceeds through `GNE-229 PLATFORM`, `GNE-230 DELIVERY`, `GNE-231 PRODUCT`, `GNE-232 ACCESS`, `GNE-233 CAPABILITY`, and `GNE-234 VERIFY`.
- MVP3 follows a 小团队 WIP rule: keep the main implementation on one parent issue at a time. The next parent can be reviewed ahead, but child issues should not be executed out of their parent issue sequence.
- MVP3 child issues are now created under `GNE-228` through `GNE-234`. They should stay off the milestone view and carry no Linear labels; the seven parent issues remain the milestone-level navigation and acceptance surface.
- MVP3 CatCare is a small Reference Product, not a demo reskin. It must be good enough to prove that the common foundation can support a real product flow, even though live payment, live AI, and full business automation remain out of MVP3 scope.
- For GNE-280 UI/SYSTEM, the binding UI reference is `specs/reference-product/prototypes/v6-regenerated-normalized/` plus `specs/reference-product/gne-278-product-flow.md`. Older uploaded prototype images and discarded prototype drafts are historical input only and must not override the regenerated split screens or Markdown specs.
- GNE-280 is limited to the CatCare UI/SYSTEM baseline for `/`, `/login?next=/catcare`, `/catcare`, `/account/billing`, and `/account/usage`. Full cat profile, routine, plan generation, private share, sitter checklist, owner result, ACCESS, live AI, and live payment flows belong to later PRODUCT/ACCESS/CAPABILITY issues.
- GNE-280 responsive acceptance must test `1470x798`, `1366x768`, `1440x900`, and `1920x1080`. Landing, Login, Dashboard, Billing, and Usage may scroll vertically when content is taller than the viewport, but must not create horizontal scroll, clipped content, or `overflow-hidden` one-screen illusions.
- GNE-280 prototype-to-page practice: use `v6-regenerated-normalized/` as visual intent, but do not blindly crop final assets from whole-page mockups when card borders, text, or background panels are baked into the bitmap. For icons, first extract prototype/source crops into product-owned assets, then trace or repair them; do not hand-draw replacement SVGs unless the prototype cannot provide a separable source or the user explicitly requests manual drawing. Current accepted icon baseline is the unthinned prototype PNG -> `potrace` fill SVG output under `apps/web/public/catcare/icons/traced/`; the thinner morphology variant is not the default. For illustration cards, normalize into same-size product assets before wiring them into components.
- `/catcare` is the canonical customer-facing product route. `/reference-product*` is only a legacy MVP3 engineering compatibility shim that redirects to the matching `/catcare*` route.
- Keep the foundation demo reachable but isolated: `/demo`, `/demo/login`, `/dashboard`, and `/demo/account*` belong to the demo surface. CatCare owns `/`, `/login`, `/catcare*`, and product-context `/account*`. Demo navigation must not lead into CatCare, and CatCare primary navigation must not lead into `/dashboard`.
- CatCare product UI may use product-owned components and assets in `apps/web`; only provider-free, product-agnostic primitives should move into `packages/ui`.
- The MVP3 30-minute Reviewer Runbook is executed under `GNE-234 VERIFY`, covering page flow, Supabase data/RLS, Vercel deployment/env, PostHog events, GitHub CI, package version, schema version, and patch-upgrade evidence.
- MVP3 cat-care business objects must not enter the platform packages. The Reference Product repo owns cats, care plans, care tasks, submissions, product prompts, and product-specific events.
- MVP3 private links must be anonymous but controlled: scoped, expirable, revocable, non-enumerable, and never logged as raw tokens.
- MVP3 delivery should not repeat MVP1/MVP2 deployment setup. `GNE-230` only verifies package化后的新增交付风险: `apps/web` consumes `@xwlc/*`, CI catches package/boundary failures, Reference Product environment differences are recorded, product migrations still use repo migrations, deployed smoke reproduces the minimum product path, and failures can be classified as app/package/env/migration/RLS/provider.
- MVP3 PLAN stage decisions are: keep Linear + repo evidence sync, continue on `main` with short task branches, keep a single monorepo with package boundaries for MVP3, use the current cloud Supabase only as reference/staging/test, keep Supabase + Vercel as the mainline, keep Cloudflare/Hono as adapter readiness only, and keep AI/Billing on mock/no-op/sandbox/test paths.
- MVP3 fails the PLAN gate if Reference Product business objects enter platform packages, implementation starts from old pre-`v0.2.0` branches, child issues are executed out of the parent sequence without an explicit decision, production Supabase/live payment/real AI are treated as MVP3 requirements, raw private-link tokens or private content become acceptable evidence, or Reviewer evidence cannot connect page flow, data/RLS, deployment, analytics, CI, package version, and schema version.
- Payment success pages, AI result pages, and analytics events are not sources of truth. They are reviewer surfaces over trusted server-side Billing, Payment, AI, and ledger facts.
- MVP4 owns real overseas/china dual-mode provider rollout, including domestic payment, domestic AI, domestic analytics, cloud, CDN, SMS, email, storage, and compliance/deployment differences.
