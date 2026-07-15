# Acceptance: Clean Template Extraction

## GNE-301 Result

This section is the completion gate for the current architecture Issue. It does
not mark the GNE-302 implementation or GNE-303 smoke as complete.

| Requirement | Result | Evidence |
| --- | --- | --- |
| current directory and architecture reflect `main` | pass | `engineering-spec.md` baseline, tree, counts, and coupling list |
| target research/candidate/product directories are fixed | pass | `engineering-spec.md` target trees |
| one product per repository/deployment | pass | singular `modules/product` rule |
| three artifact responsibilities are explicit | pass | `product-spec.md` |
| Keep/Transform/Exclude is executable | pass | `extraction-manifest.md` path/owner/action/check tables |
| all 18 migrations are classified | pass | migration disposition table, including GNE-288 lifecycle migration |
| independent CLI-created candidate baseline is defined | pass | engineering database contract |
| package snapshot/provenance boundary is explicit | pass | no registry or cross-repository upgrade claim |
| mixed package files are classified | pass | Core Demo/pricing catalog, UI fixed brand and Platform product fixtures are Transform/Exclude, not blanket Keep |
| runtime/tooling allowlist is complete | pass | app/root/Supabase/Vercel input rows, including root ignores/editor/PR template and AI safety script |
| RLS/grant operations are explicit | pass | per-table, per-role, per-operation foundation matrix |
| entity archive/history reuse boundary is explicit | pass | CatCare code Exclude; lifecycle rule Contract only with second-consumer trigger |
| lifecycle contract has a legal template transform | pass | `specs/_template/engineering-spec.md` is Transform, not byte-preserving Keep |
| UI/asset/license boundary is explicit | pass | component/asset table and notices requirement |
| security/Provider/external gates are explicit | pass | engineering, Quick Start, and test plan |
| GNE-302/GNE-303 verification path is fixed | pass | `quickstart.md` and `test-plan.md` |
| runtime code/schema/database/external resources changed | not_run / intentionally none | GNE-301 is documentation-only |

## Reviewer Sampling Checklist

The independent reviewer must sample at least these sixteen real source paths and
confirm that the manifest decision, target, and verification are unambiguous:

1. `apps/web/app/page.tsx` — Transform;
2. `apps/web/app/login/page.tsx` — Transform;
3. `apps/web/app/account/account-shell.tsx` — Transform;
4. `apps/web/components/workspace-nav.tsx` — Transform;
5. `apps/web/components/catcare-icons.tsx` — Exclude;
6. `apps/web/lib/services/auth.ts` — Transform;
7. `apps/web/lib/catcare/product-service/outbox-worker.ts` — Exclude/Contract only;
8. `packages/core/src/data.ts` — Exclude the mixed Demo file; represent only the approved neutral ownership/profile concepts in independent candidate projections;
9. `packages/platform/src/travel-consumer.compile.ts` — Exclude fixture from candidate;
10. `packages/platform/src/index.ts` — Transform into a reviewed neutral public-API projection; exclude the research capability-context/share-token files and independently retain only their approved provider-free decisions;
11. `apps/web/proxy.ts` — Transform and include as an app runtime input;
12. `supabase/config.toml` — Transform to neutral local identity/Auth URLs;
13. `supabase/seed.sql` — Transform to empty/deterministic neutral seed;
14. `20260618070613_create_data_template.sql` — Fold profile/function, exclude Demo;
15. `20260708112135_create_audit_events.sql` — Exclude/Contract only;
16. `20260713092452_catcare_soft_delete_plan_participants.sql` — Exclude CatCare implementation, retain lifecycle contract only.

The reviewer also confirms that source migrations remain unchanged and that no
candidate filename or history entry was invented in GNE-301.

## GNE-302 Implementation Gate

GNE-302 may be considered complete only when:

- the research repository dependency direction matches the approved target or
  an explicitly documented, reviewer-approved equivalent;
- home/login/account/Billing/Usage/product placeholder consume neutral config
  and platform boundaries with no CatCare/Demo reverse import;
- package and release boundary checks include meaningful negative fixtures;
- allowlist generation is safe, deterministic, atomic, and exhaustive;
- `template-version.json`, dependency/asset notices, and the independent
  foundation migration are produced with traceable provenance;
- one generated candidate installs, lints, typechecks, tests, and builds in an
  isolated clean directory;
- candidate pollution/security checks pass;
- CatCare and Demo behavior affected by moves has not regressed;
- an independent Terra Reviewer has no unresolved blocking finding;
- the run stops without activating GNE-303.

## GNE-302 Local Implementation Result

The table below records the first PR #96 candidate and is superseded for final
GNE-302 closure by the Strengthened Completion Gate below. It remains useful
historical evidence but does not by itself satisfy the reopened Issue.

This is implementation evidence, not the independent GNE-303 release decision.

| Requirement | Result | Evidence |
| --- | --- | --- |
| approved boundary implemented without changing CatCare/Demo runtime | pass | explicit `template/blueprint` inventory; research regression suite |
| neutral app, package snapshots and provider modes | pass | generated Home/Auth/Account/Billing/Usage/product surfaces and boundary tests |
| deterministic, atomic, exhaustive generation | pass | schema validation, inventory/secret/path checks, two-output comparison |
| exact supply-chain and provenance record | pass | candidate lockfile, notices, Action SHA checks and `template-version.json` hashes |
| isolated clean install/lint/typecheck/tests/build | pass | generated sibling candidate, frozen install and production build |
| independent local foundation database | pass | single baseline reset on candidate-only ports; 141 pgTAP checks across anon, owners A/B and service-role operations |
| shared cloud database or provider secrets used | not_run / intentionally none | GNE-302 local-only gate |
| independent Terra review and research PR | review pass; PR pending | Terra READY after three review rounds; research PR remains the final close gate |
| fresh external repository/Vercel smoke | not_run | owned by GNE-303 and separately gated |

The generated candidate remains a candidate artifact. This section does not
claim multi-product proof, production readiness, or completion of GNE-303.

## GNE-302 Strengthened Completion Gate

GNE-302 may return to Done only when fresh evidence proves:

- source-to-template drift detection passes and a stale source hash fails;
- default output is neutral while `product:init` derives the Smoke fixture
  without platform/package edits;
- `/product` stays thin and `modules/product` owns product composition;
- UI, local-state interaction, owner cache, tag invalidation, targeted path
  refresh and capability modes all have real consumers;
- external modes fail clearly when required environment is absent;
- Analytics base dimensions cannot be overridden by callers;
- publishable-key, SSR headers, `getClaims`, CSP and financial-retention checks
  pass;
- candidate CI includes disposable migration and pgTAP;
- a fresh candidate completes frozen install, lint, typecheck, test and build;
- two disposable local resets and pgTAP pass without a shared cloud database;
- Terra review has no unresolved blocker;
- execution stops before GNE-303 and leaves GNE-298 open.

### Strengthened Local Acceptance Evidence

| Requirement | Result | Evidence |
| --- | --- | --- |
| source changes cannot silently leave template projections stale | pass | 14 projected + 18 explicitly excluded files, six complete Transform/Fold inventories, and stale-hash/untracked-file/inventory negative fixtures |
| generation is reproducible | pass | two 112-file fresh outputs from `078a1d9` have the identical normalized tree hash |
| a new product can initialize without rewriting the platform | pass | Second Product initialization changes exactly the four declared config projections |
| the mother template remains verifiable after derivation | pass | pristine and derived `template:verify` both validate signed provenance outside the four-file boundary |
| product/UI/performance/provider seams have real consumers | pass | thin route, product module, interactive workspace, owner cache/invalidation and capability matrix checks |
| Auth/Analytics/Supabase/security/retention boundaries are enforced | pass | unit, release, security and boundary suites, tracked-private-env negative proof, plus pristine and derived production builds |
| independent database foundation is reproducible | pass | two disposable local resets and 149/149 pgTAP checks; local volume removed afterwards |
| local route behavior is executable without Provider secrets | pass | `/` and `/login` return 200; `/product` and `/account` render explicit Auth-disabled states; security headers and no-store responses are present |
| research product runtime behavior changed | no | implementation is confined to template/spec/context/tooling inputs |
| shared cloud database or external deployment changed | no | no linked Supabase, new GitHub repository, Vercel project or provider secret used |
| independent visual/responsive and external-repository proof | not_run | remains GNE-303 scope, not a GNE-302 completion claim |
| independent Terra review | pending | must be resolved before GNE-302 returns to Done |

## GNE-303 Verification Gate

Full Go requires:

- a second fresh generation with identical normalized output;
- independent clean install/build/tests and neutral page/responsive review;
- two disposable empty-database resets with RLS/grant/ownership negatives;
- security headers, session/cookie, safe return, secret, dependency, license,
  and asset provenance verification;
- a temporary Smoke Product whose identity changes without platform/package
  edits;
- an approved independent GitHub/Vercel test deployment with traceable commit
  and environment-key status.

The local/user acceptance surface must additionally prove: real disposable
sign-up/sign-in and sign-out, profile persistence after refresh, no full-page
reload during profile save or locale change, visible English/Chinese copy on
all primary routes, accessible dismissible Dialog/Toast/Form states, and no
PostHog browser SDK request while Analytics is disabled. The neutral candidate
must not claim that a UI-only interaction saved a business fact.

If the external repository/deployment operation is not approved, all local
gates may support **Conditional Go**, but the deployment row remains `not_run`.
Product pollution, non-reproducible generation/build/database, failed RLS, or a
secret/license issue is **No-Go**.

### GNE-303 Local Acceptance Record (2026-07-15)

| Gate | Result | Evidence |
| --- | --- | --- |
| neutral + Smoke generation and identity boundary | pass | both candidates verify with protected=115, product=5; only generated identity/config/provenance outputs differ outside reproducible residue |
| editable-product / protected-platform mutation | pass | changing the existing product workspace remains verifiable; changing a platform file fails the protected foundation hash |
| repeated neutral generation | pass | two pristine `0.2.0-candidate.2` trees from the same final source commit are byte-identical |
| clean install/lint/typecheck/test/build | pass | both corrected candidates pass all five packages, 23 contract tests and Next production build; shared first-load JS is about 103 kB |
| empty local database rebuild | pass | two resets from one baseline; 149/149 pgTAP/RLS/grant tests pass after each reset |
| real Auth/profile/cache flow | pass | disposable local sign-up, protected return, sign-out/sign-in, in-place profile save, same-URL success, refresh persistence and one matching DB row |
| i18n/UI/responsive | pass | English/Chinese same-URL switch; shared Form/Dialog/Toast/State controls; 390 px and 1440 px have no horizontal overflow |
| disabled Analytics | pass | no static PostHog import; SDK is dynamically gated by external mode and a valid public key |
| shared cloud DB/provider secrets | not_run / intentionally none | isolated local 5532x stack only |
| external candidate GitHub/Vercel | not_run / target approval required | does not block local Conditional Go |

### Post-review Candidate.3 Result

| Gate | Result | Evidence |
| --- | --- | --- |
| authentication modes and failure recovery | pass | separate sign-in/sign-up/reset/update-password paths, localized invalid-credential feedback, PKCE confirmation callback, safe internal return tests |
| real local account sign-out/sign-in | pass | `gne303-review@example.test` authenticated again through the browser and returned to `/product` |
| locale-sensitive controlled UI | pass | English/Chinese switch on the same URL and updates the workflow textarea rather than retaining stale `defaultValue` copy |
| shared contracts and accessibility | pass | shared variants/loading, localized Dialog/Toast dismissal and conditional FormField ARIA descriptions have package and app contract coverage |
| clean candidate quality gate | pass | candidate `.3`: frozen install, lint, typecheck, 29 package/app tests, production build and post-build integrity verification |
| GitHub, Vercel, shared cloud resources | not_run / unchanged | user acceptance gate remains active; no external write occurred |

This record resolves the immediate three-party findings that would otherwise
be inherited by every future product. It does not close GNE-303 or GNE-298;
the final local server, isolated database, and test account remain available
for the user's page acceptance.

## Capability Classification At Parent Completion

| Class | Meaning |
| --- | --- |
| template-ready | generated, independently verified, and safe for candidate use |
| safe-disabled | adapter/route remains but optional provider absence is explicit and tested |
| pattern-only | proven in CatCare but not copied or packaged without a second consumer |
| deferred-gate | becomes required only when its documented product/production trigger occurs |
| not-run | no evidence and no completion claim |

Parent GNE-298 cannot close until every retained capability is assigned exactly
one class with evidence and every `not_run`/deferred item has an owner category
and trigger.

## Stop Rule

After GNE-303 local, independent and approved external evidence is complete,
stop for user acceptance. Do not automatically close GNE-298, activate another
Issue, touch the shared cloud database, or create an external repository /
Vercel project without the target-specific approval recorded for this run.
