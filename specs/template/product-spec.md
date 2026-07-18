# Product Spec: Clean Web Starter Template Candidate

## Strong-Template Product Outcome

The candidate is not accepted merely because it can be copied and built. It
must let a second and later single-product repository initialize a distinct
identity, keep product implementation in `modules/product`, consume tested
platform/UI/caching/provider boundaries, and detect when the research
capability source changes without a reviewed template projection. The template
optimizes for durable product velocity, not the smallest file count.

The user-facing initialization contract is one `product.config.json` plus
`pnpm product:init`. A pristine neutral candidate and a derived Smoke Product
are distinct artifacts. The Smoke identity is disposable evidence and must not
become the default template identity.

## Decision

GNE-301 freezes the product boundary for a separately generated clean template
candidate. The current `ai-web-starter-kit` remains the research and evidence
repository; it is not cleaned in place. GNE-302 may implement only the boundary
approved here, and GNE-303 must validate the generated artifact outside the
source workspace.

For the user-approved GNE-303 completion contract, validation is user-visible:
the neutral candidate must support isolated local sign-up/sign-in, in-place
profile persistence with precise owner-cache invalidation, global English /
Chinese switching, and real consumption of shared UI interaction primitives.
These are neutral foundation proofs, not a placeholder product workflow.
The same proof must be rerunnable by a new product repository through one
non-overwriting environment initializer and a committed desktop/mobile browser
smoke; acceptance must not depend on chat-only instructions or a reviewer
manually reconstructing the flow.

The candidate is a **single-product starter**, not a multi-product deployment.
Each real product is generated into its own repository, owns one
`apps/web/modules/product` implementation, and deploys independently.

## Users

- a product owner starting a new Web SaaS idea without deleting CatCare files;
- an implementer who needs Auth, account, Billing/AI/Analytics boundaries, UI
  primitives, CI, and database safety before writing product code;
- a reviewer who must distinguish reusable foundation from CatCare, Demo, and
  historical evidence;
- a platform maintainer who needs a traceable source/template version without
  claiming that a package registry or cross-repository updater already exists.

## Problem

The research repository intentionally combines four responsibilities:

1. reusable package and platform development;
2. the CatCare Reference Product;
3. the Foundation Demo;
4. MVP execution and acceptance history.

Copying that repository would leak product routes, data models, assets,
migrations, environment identity, and historical evidence into a new product.
Deleting those items by hand is not repeatable and can also remove proven Auth,
Billing, AI, Analytics, UI, and engineering capability.

## Product Outcome

After GNE-298 is complete, a user can generate a clean candidate and then a
temporary Smoke Product that can:

- install from a clean directory with the committed lockfile;
- render a neutral home page, sign-up/sign-in, account, Billing, Usage, 404,
  loading, empty, error, and disabled states;
- change product name, brand mark, theme, copy, CTA, navigation, and the safe
  signed-in landing path through product configuration;
- use Supabase Auth and a foundation database baseline without CatCare or Demo
  tables;
- keep Payment in sandbox/disabled mode, AI in mock/no-op/disabled mode, and
  Analytics optional when provider configuration is absent;
- consume the four public `@xwlc/*` package roots without importing package
  internals or CatCare DTOs;
- run CI, package/release boundary checks, lint, typecheck, tests, and build;
- state its source commit, template version, database schema version, dependency
  provenance, and asset/license provenance.

## Three-Repository Responsibilities

| Repository or artifact | Owns | Must not claim |
| --- | --- | --- |
| `ai-web-starter-kit` research repository | shared capability development, CatCare, Demo, all 18 historical migrations, acceptance evidence, generator source | that the repository itself is a clean template |
| `xwlc-web-starter-template` candidate | neutral app shell, public package snapshots, provider adapters/configuration, CI, specs/context bootstrap, foundation baseline | CatCare/Demo behavior, multi-product proof, central package distribution, production readiness |
| temporary Smoke Product | a different neutral identity and disposable product placeholder used to test generation, build, database, security, and deployment | a real second product or proof that speculative feature modules are reusable |

## Default Product Surface

The candidate must provide these real consumer pages rather than an empty
scaffold:

| Route | Required behavior |
| --- | --- |
| `/` | configured neutral identity, value statement, CTA, Auth-aware action |
| `/login` | sign in/sign up, confirmation error, safe local `next`, neutral side content |
| `/auth/confirm` | Supabase confirmation exchange and safe return path |
| `/account` | protected profile, navigation, sign out, product slot |
| `/account/billing` | configured plans or explicit sandbox/disabled state |
| `/account/usage` | Credit/usage or explicit mock/disabled state |
| `/product` | protected product workspace placeholder owned by the generated product |
| 404/error/loading | neutral recovery action and accessible focus/label behavior |

The exact route files may remain thin Next.js adapters. Product behavior belongs
under `apps/web/modules/product`; platform composition and provider adapters
belong under `apps/web/modules/platform`.

## Configuration Contract

Product identity must be replaceable without editing platform or package core:

- stable product ID and display name;
- text or licensed image brand mark;
- theme tokens;
- locale and neutral copy;
- public home CTA;
- safe signed-in landing path;
- navigation entries and account return path;
- Billing, Payment, AI, and Analytics modes;
- product-owned event namespace and module identifier.

Configuration cannot contain secrets, external return URLs, arbitrary React
imports, database table names, product DTOs, or provider payloads. Safe return
paths must remain app-local and reject protocol-relative or external URLs.

## Reuse Boundary

The candidate includes `@xwlc/core`, `@xwlc/ui`, `@xwlc/platform`, and
`@xwlc/db` as a local workspace snapshot generated from a recorded source
commit. This is a practical cold-start mechanism for the first candidate. It is
not evidence of registry publication or automatic upgrades across repositories.

The neutral Auth shell includes email/password access, scanner-safe password
recovery, and an optional Google OAuth path that becomes usable only when the
new product configures Google in its own Supabase project. Starting Google from
an already signed-in browser replaces that local session without merging
different email identities. Apple remains disabled until a future product owns
the Apple Developer configuration and acceptance evidence. Sensitive recovery
routes do not initialize product Analytics.

Client image preprocessing is deliberately not part of this candidate release.
It is currently proven by one product only; its compression dimensions, file
limits, EXIF policy and upload contract remain product-owned until a second real
consumer or a neutral candidate capability proves a stable interface.

CatCare Outbox worker/store/event types and deterministic Audit IDs remain
product-bound. Their proven patterns may be referenced, but extraction waits
until a working second product would otherwise copy the same semantics.

The CatCare archive implementation also remains product-bound. The candidate
does carry a product-design contract: mutable entities referenced by immutable
history are archived by default, active surfaces hide them, and historical
facts retain a stable snapshot with an explicit deleted marker. It does not
carry a generic soft-delete table, hook, API, or UI component until a second
real product proves the same implementation boundary.

## UI And Asset Policy

The candidate is not visually empty. It keeps only provider-free components and
generic icons that its neutral pages actually consume. CatCare brand, cats,
pricing art, semantic care icons, prototype crops, generated illustrations, and
product compositions are excluded.

Every included font, icon, image, binary asset, and dependency must have a
recorded source, license, and redistribution decision. An unclear license means
exclude. The current root MIT license remains a candidate input, while a
candidate `THIRD_PARTY_NOTICES.md` is required before acceptance.

## Database Product Boundary

The candidate receives one independent, Supabase-CLI-generated timestamp
migration containing the final foundation state. It does not copy, rename,
squash, or mark the research repository's 18 files as its own history.

The baseline may contain the final generic user profile, Billing, Entitlement,
Credit/Usage, and service-only Payment event boundaries required by candidate
pages. It must not contain `demo_items`, CatCare tables, CatCare Storage, share
tokens tied to care plans, CatCare Audit event unions, or CatCare Outbox event
unions. Migration ledger head plus `template-version.json` provide the candidate
schema version; no speculative runtime schema-version table is required.

## Non-Goals

- cleaning or deleting CatCare/Demo from the research repository;
- developing a real second product;
- creating a component marketplace or speculative map/upload/search kits;
- publishing a package registry or implementing cross-repository upgrades;
- extracting single-consumer Outbox/Audit internals;
- live AI, real payment, real notification delivery, production providers, or
  Production database operations;
- creating a GitHub repository, Vercel project, or cloud database in GNE-301.

## Success Criteria

- the current and target architecture can be explained without chat history;
- every relevant source area has an executable Keep/Transform/Exclude/
  Contract-only/Not-run decision;
- GNE-302 does not need to reopen repository ownership, route, UI, database, or
  publication-boundary decisions;
- GNE-303 can follow one cold-start path and produce pass/fail/not_run evidence;
- a new product can replace identity and product behavior without importing or
  copying CatCare DTOs, pages, services, assets, migrations, or event unions.

## GNE-315 Final Product-Hardening Contract

The generated repository must be a usable starting point for a real
multi-page single product, not only a configurable one-page placeholder. A
product owns one configurable workspace root such as `/product` or `/trips`
and may add nested product pages below that root. Platform routes such as Home,
Login, Account, Auth callback, Billing and Usage remain protected.

Foundation browser evidence is product-independent. Auth, profile persistence,
locale, cache invalidation, safe return paths, Provider safe-disabled states and
shared account interactions remain under a protected foundation test suite.
Product tests are replaceable and may be empty before the first product flow is
implemented. A product is never required to retain sample controls merely to
make a shared-component inventory check pass.

The neutral workspace shows an honest empty starting state and capability
status. It does not simulate saved work, fixed completion progress or a
successful business command. Dialog and Toast remain only where the protected
account shell uses them for real confirmation and persisted-profile feedback.
The shared UI package keeps a small tested neutral icon set and components with
names that match their semantics; it does not add speculative data, map, chart,
upload or full icon-library components.

GNE-315 changes the mother-template source and generated candidate only. It
must not change CatCare or Demo runtime behavior. A temporary multi-page product
derivation is acceptance evidence and is not retained as mother-template
product code.
