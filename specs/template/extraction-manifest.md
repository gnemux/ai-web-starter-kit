# GNE-301 Extraction Manifest And Coupling Inventory

## Capability Source Projection And Drift

`template/blueprint` is a curated neutral projection, not an independent
untracked implementation source. `template/source-map.json` assigns one
research capability source to each retained package/platform projection and
records the reviewed source hash and projection strategy. `pnpm
template:drift` fails whenever a source changes until the mapped projection is
reviewed and the recorded hash is intentionally updated. It also inventories
all files under the watched shared-package, Supabase and Analytics roots; a new
file must be mapped or explicitly excluded with a reason, so adding a capability
cannot bypass the drift gate. Candidate-only shell, initialization, baseline
and product-slot files remain blueprint-owned.

## Purpose

This document is the human-reviewable source for the machine manifest that
GNE-302 will implement. `Keep` means an allowlisted copy, `Transform` means a
deterministic named rewrite, `Exclude` means the path must not appear in the
candidate, `Contract only` means no runtime copy, and `Not run` means no ready
claim.

Every generated entry must also carry the full source commit, template version,
owner, product-editability, action, and verification rule.

## Ownership

| Owner | May contain | Must not contain |
| --- | --- | --- |
| `shared-package` | provider-free public contracts, pure helpers, UI primitives | product DTOs/routes/tables/copy, runtime SDKs |
| `platform-app` | Next/Supabase/PostHog adapters, neutral Auth/account/Billing/AI composition | CatCare/Demo policy or presentation |
| `product` | generated product routes, DTOs, services, events, policy, copy, assets | package internals or another product |
| `research-reference` | CatCare implementation and acceptance evidence | candidate output |
| `research-example` | Demo routes/data and teaching examples | candidate output |

## Top-Level Classification

| Source | Class | Target/owner | Product editable | GNE-302 action | Verification |
| --- | --- | --- | --- | --- | --- |
| `packages/core` | Transform | same / shared-package | No | snapshot only neutral files/exports; split mixed Demo contracts below | root import, zero Demo/product symbol, boundary tests |
| `packages/ui` | Keep/Transform | same / shared-package | No | snapshot neutral primitives; make/remove hard-coded brand export below | root import, page consumer, responsive states, zero fixed product brand |
| `packages/platform` | Transform | same / shared-package | No | snapshot neutral runtime contracts; exclude/product-neutralize fixtures below | root import, no runtime/product dependency or product fixture |
| `packages/db` | Keep | same / shared-package | No | snapshot | root import and schema evidence types |
| `apps/web/app`, `components`, `lib` | Transform | routes + `modules/platform` + `modules/product` | Split by owner | explicit mappings below | import graph and pollution scan |
| research `apps/web/proxy.ts`, `instrumentation-client.ts` | Transform | candidate `middleware.ts` / platform-app | No | retain neutral request/session and Analytics bootstrap only; use the framework entry convention matching locked Next.js 15 | build, executable middleware, safe route and disabled-Analytics checks |
| `apps/web/package.json`, `next-env.d.ts`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `tsconfig.json` | Keep/Transform | candidate app toolchain | No | include all build inputs; remove product-only scripts and resolve dependency versions through the committed lockfile | frozen install, lint, typecheck, test, build |
| `apps/web/public/catcare` | Exclude | research-reference | N/A | copy nothing | zero path/hash/name match |
| `supabase/migrations` | Transform/Exclude | one independent candidate migration | No | derive final state; never copy history | empty reset twice and ledger check |
| `supabase/tests` | Transform | candidate DB tests | No | keep only retained schema/RLS semantics | positive and owner/anon negative tests |
| `specs/_template` | Keep/Transform | candidate spec templates | Yes | copy neutral templates; transform engineering template below | required headings and no history |
| capability specs/integrations | Transform | short neutral candidate docs | Controlled | allowlist stable contracts only | no CatCare/Issue/production claim |
| `specs/reference-product` | Exclude | research-reference | N/A | copy nothing | zero path and evidence keyword match |
| `context/*` | Transform | short initialized context | Yes | generate stable rules/current blank status | no MVP execution history |
| `.github/workflows/ci.yml` | Keep/Transform | candidate CI | No | retain install/lint/typecheck/test/build/boundaries | workflow syntax and CI run |
| `.github/pull_request_template.md` | Keep/Transform | candidate review gate | No | retain neutral validation/no-secret sections; remove research-stage or CatCare-only wording | template scope and gate review |
| staging migration workflow | Exclude from default candidate | operator-specific | N/A | include only after a product chooses its staging workflow | no shared project identity/secrets |
| `.codex`, `AGENTS.md`, collaboration specs | Transform | concise entry + formal orchestration | No | preserve gates, reset project identifiers/task history | config parse and orchestration simulation |
| `scripts/verify-*boundaries.mjs` | Transform | candidate boundary checks | No | replace CatCare/Demo lists with candidate invariants | negative fixtures must fail |
| `scripts/verify-ai-safety.mjs` | Keep/Transform | candidate AI safety gate | No | retain because root `pnpm test` invokes it; neutralize any product fixture if inventory finds one | positive and unsafe fixture checks |
| root `.gitignore` | Keep/Transform | candidate repository hygiene | No | retain ignores for env, dependencies, build/cache and Vercel/local tooling; remove only research-only paths if harmless | forbidden residue cannot be staged |
| root `.editorconfig` | Keep | candidate editor baseline | No | byte-preserving copy | formatting smoke |
| `.env.example` | Transform | neutral placeholders | Yes, non-secret only | remove current product/stage/provider assertions | secret/public lint and docs match |
| `LICENSE` | Keep | candidate root | No without owner decision | copy MIT text | checksum and legal review |
| `THIRD_PARTY_NOTICES.md` | Missing/Transform | candidate root | No | generate dependency/asset inventory | all redistributed inputs covered |
| `README.md` | Transform | candidate root | Yes | cold-start and customization guide | independent reviewer follows it |
| lockfile/workspace/turbo/TypeScript/Next config | Keep/Transform | candidate root | No | copy only declared workspace inputs | frozen install/build |
| root `vercel.json` | Exclude | duplicate research deployment config | N/A | copy nothing; do not create two deployment authorities | zero root config in candidate |
| `apps/web/vercel.json` | Transform | candidate app deployment config | Controlled | Root Directory `apps/web`; Next.js preset; frozen root install; filtered `@xwlc/web` build; `.next` output; main-only deploy policy | exactly one config and independent deployment check |
| `supabase/config.toml` | Transform | candidate local DB config | No | derive neutral `project_id`, fixed documented local ports and Auth URLs from candidate config; remove research identity | config parse and two local resets |
| `supabase/seed.sql` | Transform | candidate neutral seed | Controlled | generate empty/comment-only or deterministic product-neutral seed; remove Demo/CatCare history | two identical reset states |
| `supabase/.gitignore` | Keep | candidate Supabase tooling | No | copy | ignored local state check |
| `supabase/README.md` | Transform | candidate DB guide | Yes | document foundation baseline and disposable-local-only reset | reviewer cold start |

## Package File Classification

Package directories are not atomic `Keep` units. GNE-302 must classify their
files so the local workspace snapshot is reusable without carrying fixture
products.

| Source | Class | Candidate action | Verification |
| --- | --- | --- | --- |
| `packages/core/src/auth.ts`, `payment.ts`, `providers.ts`, `ai.ts` | Transform | project only the provider-free contract subset and remove research-only defaults or compatibility surface | exported-root compile, source hash gate and no app/runtime SDK import |
| `packages/core/src/billing.ts` | Transform | retain neutral ledger/entitlement decision types and pure rules; move plan IDs/rank, feature keys, default plans/prices/quotas and product copy to generated product config | no `defaultBillingPlans`, default prices, product feature catalog, amount or pricing copy in shared root; configured catalog tests |
| `packages/core/src/api.ts` | Exclude | mixed Demo API contract is not copied; neutral result/error contracts are projected independently in Platform | no `DemoItem`, `demoItem*`, source path or copied file in candidate |
| `packages/core/src/data.ts` | Exclude | mixed Demo data contract is not copied; profile ownership is represented by independent candidate contracts | no `DemoItem`, `demo_items`, source path or copied file in candidate |
| `packages/core/src/index.ts` | Transform | export only retained neutral modules | candidate root import exposes no Demo/product symbol |
| `packages/platform/src/index.ts` | Transform | build a reviewed public-API projection containing neutral actor/session/result/owner, capability, Analytics/email ports and pure public-access decisions | source hash gate, exported-root compile and neutral contract tests |
| `packages/platform/src/capability-context.ts` | Exclude | research capability context carries product-stage semantics; the candidate defines its smaller neutral capability registry in the projected public root | no source path or product-stage key in candidate |
| `packages/platform/src/share-token-gate.ts` | Exclude/Contract only | do not copy the single-consumer gate; retain only an independently expressed provider-free access decision in the public projection | no token runtime/crypto/store and pure access-decision tests |
| `packages/platform/src/travel-consumer.compile.ts` | Exclude | fixture stays in research repository | no Travel/product path or symbol in candidate |
| `packages/platform/src/capability-contracts.test.mjs` | Exclude | research tests contain product fixtures; candidate owns separate neutral Platform tests | no CatCare/Travel fixture and candidate negative cases pass |
| `packages/ui/src/index.tsx` | Transform | project neutral primitives, make branding config-driven and add only candidate-consumed interaction/state components | no hard-coded product identity; real page consumers and accessibility checks |
| `packages/db/src/index.ts` | Transform | project provider-free schema/RLS/ownership evidence contracts and pure validators | source hash gate, root compile and no concrete product table |
| package `package.json`/`tsconfig.json` files | Transform | keep workspace names/exports/scripts; use exact external dependency versions resolved from the committed lockfile | frozen install and lockfile/package consistency |

### Public API disposition

The candidate package snapshot is intentionally useful, but it does not imply
that every research implementation is generic. The retained public surface is
reviewed API by API:

| Package | Retained in candidate | Deliberately deferred or product-owned |
| --- | --- | --- |
| `@xwlc/core` | provider contracts, Auth vocabulary, Billing ledger and entitlement decision types, safe internal paths, pure archive/active/deleted-label helpers | mixed Demo API/data files, pricing catalog, feature IDs, product quotas/copy and every CatCare/Demo DTO |
| `@xwlc/platform` | session/actor/result contracts, authenticated/verified/owner guards, email-verification and Analytics ports, capability registry and provider-free public-access decision | Supabase stores, product event unions, CatCare Audit IDs, Outbox worker/state persistence and concrete email/Payment/AI providers |
| `@xwlc/ui` | configurable brand/shell, button/card/badge, section header, panel, tabs, progress, dialog and empty/loading/error/long-content states, each consumed by the neutral app | product artwork, domain icons/copy, route policy and a full design system or chart/map library without a real consumer |
| `@xwlc/db` | schema/RLS/ownership evidence types and pure validation helpers for retained foundation tables | Supabase client/store code, product tables, product migrations, Audit/Outbox persistence and storage buckets |

`Contract only` means the candidate may keep a provider-free decision shape or
design checklist, not a pretend runtime. A second real product is the trigger
for extracting repeated Outbox state-machine or deterministic event-ID code;
until then those implementations stay with their product.

## Spec Template Classification

| Source | Class | Candidate action | Verification |
| --- | --- | --- | --- |
| `specs/_template/engineering-spec.md` | Transform | add a neutral archive/tombstone and immutable-history decision checklist; include no CatCare table, API, route, UI, or localized product copy | generated product spec asks whether historical facts require snapshots/deleted markers |
| other `specs/_template/*` files | Keep/Transform | copy when already neutral; transform only repository identity or research-history wording | required headings, no MVP/Issue/CatCare history |

## Route Classification

| Source group | Class | Owner/target | Required transform or exclusion |
| --- | --- | --- | --- |
| `app/page.tsx` | Transform | platform-app route | neutral config-driven page; signed-in CTA uses configured local product path |
| `app/login/page.tsx` | Transform | platform-app/Auth | remove CatCare brand/hero/icons/copy; default `next` comes from safe config |
| `app/login/actions.ts`, `auth-form.tsx`, `login/auth/route.ts` | Transform | platform-app/Auth | retain behavior and Analytics safety; no product default |
| `app/auth/confirm/route.ts` | Transform | platform-app/Auth | preserve code exchange and validated return path |
| `app/account/account-shell.tsx` | Transform | platform-app/account | render neutral shell, not `CatCareAppShell` |
| account profile/action/form | Transform | platform-app/account | retain generic profile behavior |
| account Billing/Usage | Transform | platform-app/capabilities | retain shared facts; product pricing/copy/assets become config/product slots |
| account Payment/API Payment | Transform | platform-app/Payment | sandbox/disabled default; service-side truth only |
| `app/api/ai/text` | Transform | platform-app/AI | mock/no-op/disabled default, trusted Credit gate |
| `app/catcare/**` | Exclude | research-reference | no route, component, test, copy, or import in candidate |
| `app/s/[token]/**` | Exclude | research-reference | no CatCare share projection/submission policy |
| `app/reference-product/**` | Exclude | research-reference | no compatibility redirect |
| `app/demo/**`, `app/dashboard/**`, `app/api/demo-items/**` | Exclude | research-example | no Demo route/service/data contract |
| new `app/product/**` | Transform output | product | one protected neutral placeholder; product owns replacement |
| global layout/CSS/icon/metadata | Transform | platform-app | neutral metadata/theme, accessible system fonts, licensed icon only |

## Component And Asset Classification

| Source | Class | Target/action | Verification |
| --- | --- | --- | --- |
| `packages/ui/src/index.tsx` | Keep/Transform | shared UI snapshot | retain neutral primitives; transform/exclude fixed `BrandMark`; candidate real consumers |
| `components/account-menu.tsx` | Transform | platform account component | configured product/workspace routes |
| `components/app-icons.tsx` | Transform | retain only neutral, used inline SVG components | no Cat/Bowl/care semantic export |
| `components/language-switcher.tsx` | Keep/Transform | platform UI | no product copy; locale reload behavior documented |
| `components/sign-out-button.tsx` | Transform | platform Auth UI | safe configured post-logout route |
| `components/workspace-nav.tsx` | Transform | config-driven nav | no CatCare keys/imports/routes |
| `components/site-footer.tsx` | Transform | config-driven footer | no CatCare brand/routes/capability claims |
| `components/catcare-brand.tsx` | Exclude | research-reference | zero import/path |
| `components/catcare-icons.tsx` | Exclude | research-reference | zero import/path |
| `components/catcare-ui.tsx` | Exclude | research-reference | zero import/path |
| `public/catcare/**` (142 files) | Exclude | research-reference | zero file/hash/path; source/license uncertainty cannot leak |
| CSS system font stack | Keep | candidate CSS | no redistributed font binary |
| candidate logo/icon | Transform output | product config/assets | generated text/simple repository-owned neutral mark with provenance |

## Library Classification

| Source | Class | Target/action | Verification |
| --- | --- | --- | --- |
| `lib/services/auth.ts` | Transform | `modules/platform/auth` | Auth/session/profile tests and no CatCare default |
| `lib/supabase/**` | Transform | `modules/platform/supabase` | server/client separation, no service key in client |
| `lib/services/billing*` | Transform | `modules/platform/billing` | generic contracts, idempotency, retained ledger tests |
| `lib/services/payment.ts` | Transform | `modules/platform/payment` | sandbox/disabled, webhook/server truth |
| `lib/services/ai*` | Transform | `modules/platform/ai` | mock/no-op and Credit failure/release behavior |
| `lib/analytics/**` | Transform | `modules/platform/analytics` | optional no-op, safe base properties, bounded delivery |
| `lib/providers/**` | Transform | `modules/platform/providers` | selectors/config only; no real default secrets/provider claim |
| `lib/access/share-token-gate.ts` | Contract only unless neutral page consumes it | platform facade | generic public package gate may remain; no persistence/resource policy |
| `lib/capabilities/**` | Keep/Transform | platform facade | consumes public root only |
| `lib/i18n*` | Transform | platform i18n + product copy slots | neutral dictionaries and long-copy checks |
| `lib/services/internal-return.ts` | Keep/Transform | platform navigation helper | reject external and protocol-relative URLs |
| `lib/services/demo-items.ts` | Exclude | research-example | zero import/path |
| `lib/catcare/**` (36 files) | Exclude | research-reference | zero DTO/event/table/import/keyword match |

## Migration Disposition

The candidate has one new CLI-created baseline. `Fold` means reproduce the
retained final schema semantics inside that new file, not copy the historical
SQL or migration version.

| Research migration | Domain | Candidate decision | Final-state treatment |
| --- | --- | --- | --- |
| `20260618070613_create_data_template` | profile + Demo + shared trigger | Transform/Fold | keep `user_profiles` and required trigger function; exclude `demo_items` |
| `20260618070813_harden_data_template` | final RLS/function hardening | Transform/Fold | retain profile policy/search-path hardening; exclude Demo and dashboard-helper history |
| `20260618070953_revoke_public_rls_auto_enable` | staging/dashboard helper history | Exclude | baseline creates no such helper |
| `20260621130735_create_billing_foundation` | generic Billing/Credit/Usage | Transform/Fold | create retained final tables, constraints, indexes, RLS, owner read, service write |
| `20260623025251_create_payment_events_webhook_boundary` | generic service ledger | Transform/Fold | retain service-only table with RLS and no public policy |
| `20260624044653_add_billing_entitlement_source_idempotency` | generic final uniqueness | Transform/Fold | define constraint in final table; no cleanup query in empty baseline |
| `20260629075823_create_reference_product_owner_model` | CatCare | Exclude | no cats/care_* objects |
| `20260703050143_extend_cat_profile_fields` | CatCare + Storage | Exclude | no cats or `cat-photos` bucket/policies |
| `20260703155601_catcare_owner_item_library` | CatCare catalog/seed | Exclude | no product catalog or seed |
| `20260704033000_expand_catcare_product_catalog` | CatCare seed | Exclude | no product data |
| `20260704043000_split_catcare_supplements_and_expand_litter` | CatCare data/schema | Exclude | no product enum/data rewrite |
| `20260707012636_create_catcare_share_tokens` | CatCare private access | Exclude/Contract only | public package gate pattern only; no care-plan FK/table |
| `20260708112135_create_audit_events` | CatCare event union | Exclude/Contract only | no product event union/table; record second-consumer trigger |
| `20260708123548_create_outbox_events` | CatCare aggregate/event union | Exclude/Contract only | no product worker/store/table; record second-consumer trigger |
| `20260708124436_add_outbox_idempotency_key` | CatCare Outbox history | Exclude/Contract only | no copied index/table |
| `20260709013908_restore_ai_credit_units` | generic Billing final semantics + historical data rewrite | Transform/Fold | define final Credit units/defaults; no historical UPDATE |
| `20260712122026_restrict_public_cat_photo_listing` | CatCare Storage | Exclude | no bucket/policy |
| `20260713092452_catcare_soft_delete_plan_participants` | CatCare lifecycle/history | Exclude/Contract only | no cats/plan snapshots/function/policy; retain only the product-design rule below |

Baseline verification must prove retained table RLS and grants, owner A/B
isolation, anonymous rejection, non-transferable ownership on UPDATE, service-
only Payment access, idempotency uniqueness, and two identical empty resets.

## Pollution Rules

The candidate must reject source paths, imports, SQL identifiers, config values,
and generated content matching these groups. Checks use explicit allowlists so
legitimate documentation can explain a forbidden term without hiding runtime
pollution.

| Group | Representative forbidden runtime values |
| --- | --- |
| product paths | `catcare`, `reference-product`, `/s/[token]`, `demo-items`, `/dashboard` Demo surface |
| product DB | `cats`, `care_`, `catcare_`, `share_tokens` tied to care plans, `cat-photos` |
| product code | `CatCare*`, `CreateCatCare*`, care-plan/submission DTOs, CatCare event union |
| product assets/copy | cat images, care icons, CatCare brand, sitter/care language |
| environment identity | current Supabase/PostHog/Vercel project IDs/URLs, Linear IDs, PR/run IDs |
| private material | raw/hashed bearer token, password, cookie, service-role key, provider payload, private notes |
| build/workspace residue | `.git`, worktree metadata, `node_modules`, `.next`, `.turbo`, `.vercel`, `.env.local`, logs |
| historical evidence | MVP execution status, reviewer identities/data, screenshots, Issue/PR chronology |

Positive fixture: a normal candidate passes. Negative fixtures must separately
inject a CatCare import, product SQL table, source absolute path, secret-shaped
env value, and unclassified manifest input; each must fail with a clear reason.

## Deferred Trigger Register

| Capability | Current class | Create/activate work only when |
| --- | --- | --- |
| provider-free Outbox state machine | Contract only | second real product would otherwise copy the same transition/lease/CAS semantics |
| deterministic safe event-ID helper | Contract only | second product needs the same retry identity semantics |
| map/upload/search kit | Not run | approved product requirement defines a product-independent contract |
| central package registry/distribution | Not run | two independent product repositories need the same package update |
| cross-repository upgrade/backfeed automation | Not run | first shared update must enter an already-created product repository |
| archive/tombstone plus immutable historical snapshot lifecycle | Contract + pure helpers; persistence deferred | a second real product would otherwise copy storage, cascade, race-closing or snapshot persistence semantics |
| multi-tenant policy | Not run | a product has tenants beyond simple owner scope |
| Cloudflare/Hono adapter | Not run | a product selects that runtime |
| live AI/payment/notification | Not run | separate provider/production gate is explicitly approved |

No future Issue is created during GNE-301. The trigger is mapped to the active
roadmap only when it becomes real.
