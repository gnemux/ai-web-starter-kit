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
8. `packages/core/src/data.ts` — Transform; retain neutral profile vocabulary and exclude Demo DTO/table;
9. `packages/platform/src/travel-consumer.compile.ts` — Exclude fixture from candidate;
10. `packages/platform/src/index.ts` — Keep as neutral local package snapshot;
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

If the external repository/deployment operation is not approved, all local
gates may support **Conditional Go**, but the deployment row remains `not_run`.
Product pollution, non-reproducible generation/build/database, failed RLS, or a
secret/license issue is **No-Go**.

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

After GNE-301 documentation, review, publication, and Linear evidence are
complete, stop. Leave GNE-298 In Progress, leave GNE-302 unchanged, and do not
generate a candidate, initialize a Smoke Product, deploy, or write a database
as part of this Issue.
