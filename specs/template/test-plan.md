# Test Plan: Clean Template Candidate

## Reopened GNE-302 Strengthening Matrix

| Risk | Required evidence |
| --- | --- |
| mother template silently lags research capability source | `pnpm template:drift` pass plus a negative stale-hash fixture |
| new product must edit platform core | generate pristine candidate, run `product:init` with the Smoke fixture, verify only declared product outputs change |
| route owns product implementation | boundary check requires `/product` to compose `modules/product` and remain thin |
| UI/performance are code-only claims | real form/dialog/tabs/popover/toast consumers; account read uses owner cache and write invalidates tag/path |
| provider mode lies | disabled/safe-adapter/external matrix and missing-environment failure |
| one Analytics project mixes identities | reserved base-property test and caller override negatives |
| SSR session leaks through cache | Proxy header forwarding, `getClaims`, force-dynamic account routes and security check |
| user deletion erases financial history | restrictive owner FK and pgTAP negative |
| SQL regression passes frontend-only CI | pinned Supabase CLI job runs reset and `supabase test db` |
| Smoke identity contaminates pristine output | separate state/config hashes and deterministic A/B comparison |

## Status And Ownership

GNE-301 defined this test matrix. GNE-302 now owns and has executed the source,
generator, candidate build, and first disposable-database evidence recorded
below. GNE-303 still owns fresh independent artifact, repeated empty-database,
page/responsive, Smoke Product, and optional external deployment evidence.

Allowed result values are `pass`, `fail`, `blocked`, and `not_run`. A nearby
passing check cannot replace an unrun required check.

## GNE-301 Architecture Checks

| Check | Method | Expected |
| --- | --- | --- |
| source baseline | compare inventory to `596286a` | 103 App Router files, 59 below `app/catcare`, 78 app-library files, 142 public assets, four packages and 18 migrations match |
| current coupling | inspect home/login/account/nav/footer imports | all CatCare shell coupling is listed |
| package boundary | inspect every package file/spec | Core Demo/default pricing catalog, UI fixed BrandMark and Platform product fixtures are Transform/Exclude; four package roles and local-snapshot limitation match |
| runtime/tooling allowlist | inspect app/root/Supabase build inputs | proxy, instrumentation, package/config, root ignores/editor/PR template, AI safety script, Vercel, Supabase config/seed/ignore/README are classified |
| migration disposition | inspect all 18 SQL files | every file has Fold/Exclude/Contract-only treatment |
| lifecycle boundary | inspect GNE-288 implementation and template contract | CatCare code is excluded; archive/history rule is Contract only with a second-consumer trigger |
| spec-template lifecycle handoff | inspect `specs/_template/engineering-spec.md` disposition | template is Transform, so GNE-302 can add the neutral decision checklist without copying CatCare implementation |
| UI/asset boundary | inspect components and `public/catcare` | generic transforms and product exclusions are explicit |
| operation gates | compare orchestration and Issue | research PR flow differs from new repo/Vercel/database gates |
| docs consistency | cross-read product/engineering/manifest/Quick Start/acceptance/context | no conflicting directory or readiness claim |

## GNE-302 Source And Generator Tests

### Import And Ownership

- packages import no app/product/runtime SDK code;
- platform app modules import no CatCare/Demo DTO, table, event, copy, route, or
  asset;
- product modules consume only public `@xwlc/*` roots and the documented
  platform app facade;
- client code imports no service-role or server-only module;
- thin routes do not hide reverse dependencies.

Run the positive check and negative fixtures for package internals, product
imports from platform, and server modules from client code.

### Manifest And Generation

- every candidate input is classified;
- an unclassified file fails generation;
- non-empty output fails without overwrite;
- path traversal and source-output nesting fail;
- a transform is named, deterministic, and traceable;
- failure leaves no apparently complete output;
- identical source/config produces identical normalized output;
- a brand/config change modifies only allowlisted product/config/asset paths;
- candidate manifest/source/package/schema/license facts agree.
- shared packages expose no fixed product brand, plan/price/quota catalog,
  product feature key or validation/demo copy; negative fixtures that re-add a
  hard-coded brand or catalog fail the boundary check;
- template metadata uses the pinned source commit timestamp rather than wall
  clock time, so identical inputs remain byte-identical after normalization;
- generated package manifests contain exact external dependency versions, the
  lockfile agrees, and CI Actions are immutable-SHA pinned or have a reviewed
  explicit exception.

### Pollution And Secret Negatives

Inject each fixture independently and require failure:

1. CatCare import/path/copy;
2. CatCare or Demo SQL table;
3. current environment/project/Issue/PR identifier;
4. source absolute path or workspace link;
5. `.env.local`, key/token/password-shaped value, private note;
6. `.git`, worktree, cache, build output, or log;
7. unknown binary or asset without provenance.

### Research Repository Regression

After structural changes settle, run once:

```bash
git diff --check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Verify the CatCare Owner/private-link/anonymous/Owner path and Demo navigation
only to the degree affected by moved imports/routes. GNE-302 must not change
accepted product behavior under the guise of extraction.

### GNE-302 Execution Record

| Check | Result |
| --- | --- |
| manifest/config/secret/path negative tests | pass |
| deterministic two-output comparison and provenance verification | pass |
| frozen candidate install, lint and typecheck | pass |
| package/release/security/unit tests | pass |
| candidate production build | pass |
| candidate-only local Supabase reset from one baseline | pass |
| foundation pgTAP suite | pass (141 full role/table/operation checks) |
| final research regression suite | pass (lint, typecheck, tests, production build) |
| independent Terra review | pass (READY after three review rounds) |
| GNE-303 fresh independent/external verification | not_run |

The table above is the historical PR #96 execution record. The reopened strong
template rerun is recorded separately so its evidence cannot be confused with
the earlier 141-check candidate.

### GNE-302 Strengthened Rerun Record

| Check | Result |
| --- | --- |
| source drift and inventory gates | pass (14 projected + 18 excluded source files, six Transform/Fold inventories; stale hash, untracked source and changed inventory all fail) |
| deterministic pristine A/B generation | pass (identical normalized tree hash) |
| Second Product initialization boundary | pass (exactly four reviewed files differ; repeat/force/rollback behavior is covered) |
| pristine candidate integrity/install/lint/typecheck/test/build | pass |
| derived product integrity/install/lint/typecheck/test/build | pass |
| product route/module/UI/cache/capability/Analytics checks | pass |
| publishable key/SSR headers/CSP/financial retention/security checks | pass, including real Git tracked-`.env.local` rejection |
| candidate-only empty database reset | pass twice from the single independent baseline |
| foundation pgTAP suite | pass (149/149) |
| local HTTP smoke | pass (`/`, `/login`, Provider-free disabled account/product states and security headers) |
| cloud database, external candidate repository, or Vercel write | not_run / intentionally outside GNE-302 |
| independent Terra review | pending at time of this repository record |
| GNE-303 fresh visual/responsive/external verification | not_run |

## GNE-303 Independent Candidate Tests

GNE-303 also closes three-party P1 findings with automated and browser evidence:
locale config/dictionaries are complete for `en-US` and `zh-CN`; changing the
locale and saving a profile use router/server revalidation without
`window.location` or `location.reload`; protected files fail checksum drift;
new files outside declared product roots fail closed; shared UI semantic tokens,
Dialog, Toast, FormField and state variants have contract tests; and disabled
Analytics has no static `posthog-js` import.

### GNE-303 Execution Record (2026-07-15)

- source regression: AI/release/package boundaries, template drift and negative
  fixtures, 14 generator tests, 82 research web tests, and production build pass;
- neutral and Smoke candidates: frozen install, lint, typecheck, boundary,
  release, supply-chain, security, 23 package/app contract tests, build and
  post-build three-layer verification pass independently;
- a real product-workspace mutation passes candidate integrity while a platform
  mutation fails the protected foundation hash, closing the independent-review
  P1 finding;
- isolated database: baseline applied from empty twice and all 149 tests pass on
  both runs; no linked/shared project command was used;
- browser: local sign-up, product protection, profile persistence, precise
  same-URL update, sign-out/back-in, two locales, shared UI lifecycle, and
  390/1440 responsive overflow checks pass;
- external repository/Vercel remains `not_run` until a target-specific approval.

### GNE-303 Post-review Hardening Record (2026-07-15)

- candidate `0.2.0-candidate.3` was generated from local source commit
  `89170f9f92d9275188f2212630bcfc5f7f3143f1` into a new independent directory;
- frozen install, five-package lint/typecheck, 29 package/app tests, production
  build, security/release/boundary checks, and post-build three-layer integrity
  verification pass (`protected=115`, `product=5`);
- Auth has distinct sign-in, sign-up, reset-password, and protected
  update-password modes; reset callbacks use the local PKCE confirmation path,
  invalid credentials produce an actionable localized message, and safe return
  validation has one shared Core implementation;
- a disposable local account was signed out and signed back in through the real
  browser; the protected profile was present after authentication;
- English and Chinese switch on the same `/product` URL, including the
  controlled textarea value that previously retained stale locale copy;
- capability mode/state vocabulary is shared by Core and Platform, and the
  visible registry is localized rather than exposing implementation enum copy;
- shared Button/Badge/Card/FormField/Dialog/Toast contracts now own variants,
  loading/dismissal and ARIA behavior used by the neutral app;
- the isolated local Supabase stack and final local web server remain available
  for user acceptance. Shared cloud resources and external deployment remain
  untouched.

### Clean Install And Build

Follow `quickstart.md` from a new directory with no source `node_modules`,
`.next`, Turbo cache, worktree metadata, or undeclared environment variables.

Required:

```text
frozen install
package boundary check
release boundary check
lint
typecheck
unit/integration tests
build
git diff --check
```

### Page And Responsive Matrix

| Surface | States | Viewports |
| --- | --- | --- |
| home | signed out, signed in, long copy | mobile plus 1366x768, 1440x900, 1470x798, 1920x1080 |
| login | sign in, sign up, confirmation failure, invalid/external `next` | mobile + desktop |
| account | profile success/error, sign out, long identity | mobile + desktop |
| Billing | sandbox configured, disabled/not configured, error | mobile + desktop |
| Usage/AI | mock/no-op, disabled, quota/error | mobile + desktop |
| product placeholder | signed in, signed out redirect, empty/loading/error | mobile + desktop |
| 404/error | neutral recovery action and keyboard/focus behavior | mobile + desktop |

No horizontal scroll, clipped controls, `overflow-hidden` fake adaptation,
whole-page refresh regression, CatCare identity, or invented Provider success.

### Database And RLS Matrix

Use only disposable local/isolated empty Supabase:

- reset from empty succeeds twice with identical retained schema;
- candidate history contains only its independent baseline;
- source and candidate schema versions/provenance match the manifest;
- only retained foundation tables are present;
- all exposed tables have RLS and explicit grants;
- `user_profiles`: anon denied; owner SELECT/INSERT/UPDATE only; cross-owner and
  DELETE denied;
- each Billing orders/subscriptions/entitlements/Credit/Usage table: anon
  denied; owner SELECT only; all authenticated INSERT/UPDATE/DELETE denied;
- `payment_events`: anon/authenticated SELECT/INSERT/UPDATE/DELETE all denied;
- service role can perform the operational writes required by all retained
  foundation facts;
- UPDATE cannot transfer ownership;
- anon and unauthenticated access are rejected;
- service-only `payment_events` is inaccessible to public roles;
- unique source/idempotency constraints reject duplicates;
- views/functions/triggers have reviewed execution/search-path behavior;
- seed is empty or deterministic neutral data.
- `set_updated_at()` has an empty/fixed `search_path`, is trigger-only for app
  roles, and direct EXECUTE is revoked from `PUBLIC`, anon and authenticated.

Run advisors when available and classify every remaining item. Local success is
not Production migration evidence.

### Security And Supply Chain

- CSP has a reviewed `frame-ancestors` policy;
- Referrer-Policy and X-Content-Type-Options are present;
- Auth/session cookie expectations and safe return paths pass negatives;
- no service key or secret appears in browser bundles/logs/evidence;
- all dependencies are represented by the committed lockfile;
- root license and third-party/asset notices cover redistributed inputs;
- optional Analytics disabled path works; enabled test path emits only bounded
  neutral properties and no CatCare/private payload.

### Independent Repository And Deployment

Only after explicit approval:

- initialize a new candidate or Smoke repository without source history;
- push only the generated artifact;
- create/configure an isolated Vercel test project;
- record source commit, candidate/template version, deployment commit, URL, CI,
  and environment-key presence without values;
- verify Vercel Root Directory `apps/web`, Next.js preset, outside-root workspace
  access, frozen root install, filtered `@xwlc/web` build, `.next` output and the
  sole app-level config match the approved contract;
- verify disabled/sandbox/mock paths at the deployed URL.

Without approval this section is `not_run`, and final status cannot be full Go.

## Review Strategy

GNE-301 and GNE-302 require an independent Terra Reviewer because the boundary
touches shared package APIs, Auth/RLS, migration derivation, supply chain, and a
broad future refactor. The reviewer is read-only and returns consolidated
findings. The original writer fixes them, then reruns only affected checks plus
the final required repository check.

## Failure Conditions

Any of these is blocking:

- product/Demo/environment/history pollution;
- product code imported by packages or platform app modules;
- configuration requires editing platform/package core;
- generation is delete-after-copy, non-deterministic, or overwrites output;
- clean install/build depends on the source workspace;
- independent empty reset fails or RLS/ownership negatives fail;
- Provider absence breaks required pages/build;
- secret, license, or provenance uncertainty;
- unrun external deployment described as pass;
- source CatCare/Demo regression caused by extraction.
