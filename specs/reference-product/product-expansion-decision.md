# GNE-274 Product Expansion Decision

## Decision

Decision: **Conditional Go for generating a clean template candidate and
starting the next real product on the proven reference stack**.

The next product specification may start now. Its implementation should be
generated into a separate product repository from a clean template candidate,
using the proven Next.js, Vercel, Supabase, and PostHog reference/staging/test
stack while consuming only public `@xwlc/*` roots. This is enough to begin
product design, data modeling, implementation, and test-environment validation.
It is not an approval for public production users, live AI, real payment,
promised message delivery, or a Cloudflare/Hono deployment.

The correct next step is not to copy CatCare. MVP3 is complete enough to derive
a **clean template candidate** now, but the current repository itself is not
that clean template because it intentionally contains CatCare, the foundation
demo, and historical acceptance evidence. Create the candidate separately from
an explicit allowlist; use the next real product as its second consumer; and
promote it to a multi-product-proven template only after that comparison.

“Travel” in existing compile fixtures and historical acceptance notes is only a
representative product namespace. It is not a selected product, roadmap promise,
or requirement for the next product.

## Evidence Baseline

| Evidence | Accepted baseline |
| --- | --- |
| Current `main` | `9538b09226b63e4ff444f1ea642f1d54be8defb1` |
| Accepted runtime repair | `82e918794350c53a8bc9a828050420f42e74c86b` (PR #89) |
| Accepted evidence sync | `55553d3a2270b3405eeb2e1550dbcc521bcdb815` (PR #90) |
| MVP3 decision | `v0.3.0-decision.md`: Go for declared MVP3 scope, not production approval |
| Reusable packages | `@xwlc/core`, `@xwlc/db`, `@xwlc/platform`, `@xwlc/ui` at `0.1.1` |
| Database proof | 17 migrations rebuild from empty and match the shared cloud test ledger |
| Online proof | GitHub CI, automatic Vercel deployment, stable URL, product journey, security negatives, and cross-system evidence pass |

## Reuse Classification

The labels below are strict. “Direct reuse” means a new product may import the
public contract without copying starter source. “Light change” means reuse the
shared contract or app adapter while adding product-owned configuration or policy.
“Pattern only” means the behavior is proven but remains product-bound until a
second consumer demonstrates the shared seam.

| Capability | Classification | Next-product action | Boundary |
| --- | --- | --- | --- |
| Actor/session, verified-email and owner checks | General foundation verified; direct reuse | Import the public `@xwlc/platform` contracts and keep the application adapter replaceable | Do not expose Supabase User as the package contract |
| Billing plans, entitlement, Credit, usage, idempotency, and AI gate contracts | General foundation verified; direct reuse plus product configuration | Reuse public `@xwlc/core` contracts; define product-specific offers, purposes, quotas, and copy | These contracts do not make the current Next/Supabase application services portable |
| Current Billing/AI application services | Current-stack pattern verified; light change | Reuse or adapt only after checking the generated app's Next/Supabase/provider boundary | Current services are application adapters, not public package APIs; live provider quality, cost, refund, tax, and reconciliation remain gated |
| UI primitives | General foundation verified; direct reuse | Compose the new product from public `@xwlc/ui` primitives | CatCare pages, copy, information architecture, and assets are not reusable foundation |
| Schema version, owner/anonymous scope, migration and RLS evidence shapes | General foundation verified; direct reuse plus product schema | Import `@xwlc/db` contracts; create product-owned tables and migrations and run the same rebuild/parity/negative-test process | CatCare tables and DTOs must not be reused as another product's models |
| Generic share-token state resolution and safe capability context | General foundation verified; light change | Reuse the public platform gate if the product needs private links; implement product resource, scope, hash/storage query, projection, and owner policy adapters | Raw token, token hash, bearer value, and private payload must never enter logs or Analytics |
| Anonymous input whitelist and idempotent submission | Product foundation can be referenced | If the product needs anonymous input, define its allowed fields, validation, idempotency key, owner projection, and tests | CatCare completion/note/date/status policy is CatCare-only |
| Analytics safe context and reliable bounded delivery | General pattern verified; light change in the current app | Reuse the shared delivery/transport boundary and shared context; define a product event union and allowlist | The current server adapter is Next/PostHog application code, not a runtime-neutral package |
| Audit enqueue and deterministic submission event ID | General pattern verified but not packaged | Implement product Audit through its facade; extract a safe deterministic ID helper only if the second consumer would otherwise copy the same semantics | Current event union, payload allowlist, Supabase write, DTO, and UI copy are CatCare-bound |
| Outbox CAS/lease/retry/dead-letter/idempotency worker | General pattern verified but not packaged | Keep delivery and event types product-local; extract only the pure state machine when a second consumer demonstrates real duplication | Current worker, store/query, destination adapter, aggregate types, payload allowlist, and event union remain CatCare/application code |
| Deployment and workspace package patch upgrade process | General foundation verified; direct process reuse | Use the environment matrix, public-export checks, package boundary checks, patch-upgrade rehearsal, CI, automatic deployment, and stable-URL smoke | The packages are currently private workspaces; cross-repository package distribution is not proven |
| Cross-repository package distribution and updates | `not_run` | The template candidate may snapshot the workspaces; choose and test a private registry, release artifact, subtree, or another explicit update channel before independently maintained products need shared upgrades | Do not claim that package `0.1.1` proves remote install or multi-repository update delivery |
| CatCare care plan, task, recap, result, routine, cat, photo, and care catalog behavior | CatCare-specific | Do not import or copy; use only as product-research reference | The next product requires its own journey, domain language, data model, policies, pages, and acceptance tests |
| Cloudflare/Hono, Worker Auth/Email, D1/KV/Queues | `not_run` | Treat as a separate runtime-adapter decision if the next product selects it | No claim of implementation or execution exists |
| Real AI, real payment, real downstream notification delivery, separate production providers | `not_run` | Activate only at the corresponding production trigger | Not required to start a product in the test/reference boundary |

`payment_events` intentionally has no public RLS policy because it is a
server/webhook-only ledger. A new product must preserve that boundary rather
than add a public policy merely for symmetry.

## How The Next Product Should Start

1. Write the product spec first: primary journey, actor types, owner and
   tenant boundaries, anonymous/private-link behavior, data lifecycle,
   billable/AI capabilities, and safe Analytics/Audit fields.
2. Generate a separate product repository from the accepted clean template
   candidate. Add product-owned routes, services, tables, migrations, specs,
   and tests there; do not carry CatCare or demo directories into it.
3. Consume only public package roots. Do not copy package source or import
   package internals. Keep product DTOs, event unions, payload allowlists,
   product policies, table mappings, and page composition in the product layer.
4. Reuse shared application adapters where their contract already fits, and
   add a product facade/adapter where product data or provider mapping differs.
   Preserve explicit actor, owner, resource, scope, token, and correlation
   inputs at every privileged boundary. Define and test tenant explicitly only
   when the product is multi-tenant.
5. During reference validation, the existing Supabase/PostHog resources may be
   shared only with clear `app`/`module`/`env` separation and product-owned
   tables/events. Before real users or live providers, create and verify
   isolated production resources.
6. When the next product reaches a working second-consumer path, compare it
   with the CatCare evidence implementation. Extract only behavior with the same semantics
   that would otherwise be copied. Keep provider stores, table mappings, destinations,
   product event types, aggregate DTOs, and UI language in application/product
   adapters.
7. Feed confirmed shared seams back into the separately maintained clean
   template candidate, rerun its disposable-product smoke, and only then mark
   the candidate as multi-product-proven.

## Clean Mother-Template Readiness

MVP3 meets its declared final acceptance and can produce a **v0.3 clean
template candidate**. It does not yet prove that every candidate seam works for
multiple products because CatCare is still the only real product consumer.

The candidate must be created as a separate repository or release artifact
from an explicit allowlist. Include public `@xwlc/*` packages, neutral Web/app
scaffolding, provider interfaces and neutral adapters, configuration examples,
CI and boundary scripts, migration conventions, spec templates, and agent/
engineering rules. Exclude CatCare routes, services, tables, migrations, assets,
copy, fixtures, product specs, and evidence; also exclude the foundation demo
routes and demo data unless the template explicitly offers them as a removable
example profile.

Do not clean the active evidence repository by deleting CatCare or demo code.
That would destroy the reference implementation and the proof used to judge
the template. Generate the candidate separately, run install/typecheck/lint/
test/build, apply its neutral migration baseline to an empty disposable
database, scaffold one disposable product, and confirm that removing the
disposable product returns the candidate to a clean working tree.

The candidate may bootstrap the next product. Call it “multi-product-proven”
only after the next real product consumes it without importing CatCare and the
shared seams are reconciled back into the candidate.

All four `@xwlc/*` packages are currently `private: true` workspaces. The
accepted patch evidence proves public-root consumption and upgrade safety
inside the current monorepo; it does not prove remote installation or shared
updates across independent repositories. This does not block generating the
candidate or bootstrapping one product because the candidate can contain the
neutral workspaces. It does block claiming a completed multi-repository update
system. Select and verify an explicit distribution/sync channel when a second
independent repository actually needs to receive a shared package update.

The documentation precondition was reviewed in
`../../context/documentation-architecture.md`. README package navigation,
public-package responsibility wording, monorepo/repository language, and the
live-Linear authority rule now match the implemented project. No remaining
documentation defect blocks the candidate; long historical status and Linear
mirror files remain non-blocking maintenance debt.

## Cloudflare/Hono Judgment

Cloudflare/Hono readiness remains **Conditional**, not Go.

| Requirement | Result |
| --- | --- |
| General logic is not restricted to Server Actions | Pass at public-package contract level; current app adapters remain Next-specific |
| Actor/owner/resource/scope/token/correlation are explicit | Pass in the reusable contracts and accepted CatCare boundaries; the next product must preserve them |
| Tenant boundary is explicit | `not_run` / not applicable to CatCare; `@xwlc/db` only reserves an optional `tenantId` shape | Define and execute owner/tenant cross-access negatives if the next product is multi-tenant |
| RLS is not the only security layer | Pass for current application owner/scope checks; a D1 negative matrix is still required |
| Facade and adapter boundaries exist | Pass as an architectural pattern; Worker/D1 adapters are not implemented |
| Non-RLS repository path exists | `not_run`; D1 or another non-RLS store needs its own policy adapter and executable negatives |
| Secret and redaction invariants survive provider changes | Required invariant; current safe context and boundary checks provide the contract, future adapters need fresh proof |

If the next product chooses Cloudflare/Hono, it must implement Worker
Auth/Email and D1/KV/Queues adapters behind the same public contracts,
reproduce owner/scope checks in application policy, and rerun the accepted authorization, token,
idempotency, redaction, and failure matrices. A platform-neutral package does
not by itself prove a platform adapter.

## Trigger-Based Next-Product Handoff

These are gates, not preassigned backlog IDs. At product kickoff, map only an
activated gate to the then-current Issue structure.

| Trigger | Required before the trigger is allowed | Current state |
| --- | --- | --- |
| First real user or live-provider operation | Isolated Supabase/PostHog production resources, reviewed environment matrix, access and rollback evidence | Not triggered |
| Public signup | Enable and verify leaked-password protection and the signup negative path | Not triggered |
| Live AI provider | Quality/cost/budget/rate-limit/degradation evaluation plus Credit and safe-observability proof | Not triggered |
| Promised email/SMS/notification | Real Outbox worker destination delivery, retries, dead-letter operations, monitoring, and reconciliation | Not triggered |
| A second product would copy CatCare Outbox or deterministic Audit ID logic | Extract a provider-free pure Outbox state machine and/or safe deterministic event-ID helper with both products as consumers | Deferred until real second-consumer evidence |
| An independently maintained product needs a shared package update | Select a distribution/sync channel and prove install, compatibility, rollback, and patch uptake outside the evidence monorepo | `not_run`; workspace patch proof only |
| First real charge | Real payment/refund/tax/settlement/reconciliation, trusted webhook, idempotency, and rollback evidence | Not triggered |
| Next Analytics maintenance | Replace stale AI dashboard “Failure test model” metadata and verify saved definitions | Non-blocking maintenance |
| Cloudflare/Hono runtime selection | Build and test Worker/D1 adapters and the non-RLS security matrix | Not triggered |

## Conditions And Non-Goals

There is no blocker to starting the next product specification. Before its first
implementation PR, generate and verify the clean template candidate and define
the product journey, data ownership, anonymous scope, capability use, and
acceptance boundary. Before public production, the triggered gates above become
blocking.

GNE-274 does not select or implement the next product, extract speculative
packages, change a business page, schema, migration, provider configuration, or
production data.
It does not bind work to existing MVP4/MVP5 Issue identifiers, because those
items may be renamed or replaced. It does not close parent GNE-234.

## Final Recommendation

Generate a separate clean template candidate, then create the next approved
product repository from it on the test/reference stack: **Conditional Go**.
The general foundation is strong enough to accelerate the second product, but the acceleration comes
from public contracts, tested engineering patterns, and explicit boundaries —
not from reusing CatCare business code. Generate a clean template candidate
separately now; use the working second consumer to justify later extraction and
promotion to a multi-product-proven mother template.
