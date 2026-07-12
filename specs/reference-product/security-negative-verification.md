# GNE-270 Security Negative Verification

## Decision

`GNE-270 VERIFY-03` is **pass** on 2026-07-12 for the current single shared
reference/test environment. The result supports the later v0.3.0 conclusion;
it does not close `GNE-234`, reconcile migration history, or authorize the next
VERIFY child.

This verification changed no runtime code, schema, migration, environment
configuration, or provider configuration. Test-only cloud records created for
cross-owner isolation were removed after the checks. Raw bearer links, token
hashes, credentials, private care notes, and reviewer identity details are not
stored in this document.

## Environment And Evidence Rules

- Deployed application: the stable Vercel reference/test URL connected to the
  single shared Supabase test project and the current PostHog project.
- Local database rehearsal: an isolated disposable Supabase stack reset from
  the repository migration files; it did not replace or mutate the cloud test
  database.
- Browser evidence: authenticated owner flow plus anonymous private-link
  states. Bearer URLs remained only in browser memory.
- Database evidence: bounded service-role reads or rollback-only SQL tests.
  Evidence records counts and outcomes, not secret values.
- Analytics evidence: PostHog event counts and property names only. `$` fields
  are SDK/system properties and are not application bearer credentials.

## Negative Matrix Result

| Scenario | Result | Fresh evidence |
| --- | --- | --- |
| Owner A opens Owner B plan | Pass | A temporary second owner and plan were created in the cloud test project. Owner A received the generic not-found surface and no plan content. The temporary owner and cascading product rows were deleted afterward. |
| Owner isolation at database boundary | Pass | `catcare_owner_rls.sql` and `catcare_access_boundary.sql` passed against a fresh local reset, including cross-owner read/write rejection. |
| Anonymous reads token records directly | Pass | A direct cloud REST request using the public key was rejected with `401`; no token metadata was returned. The local SQL suite independently verifies the RLS boundary. |
| Anonymous writes a submission directly | Pass | A direct cloud REST write using the public key was rejected with `401`; no row was written. Anonymous product writes remain available only through the bounded server action. |
| Valid private link | Pass | The deployed anonymous page showed only the authorized plan scope. It exposed no owner navigation, account/Billing/AI controls, internal IDs, owner ID, token hash, or bearer credential. |
| Expired private link | Pass | A test link was moved to an expired state through a bounded test-only metadata update. The deployed page showed the explicit expired state and no plan, cat, or task content. |
| Tampered private link | Pass | A one-character mutation produced the explicit unavailable state and disclosed no plan content. |
| Repeated link generation | Pass | Regeneration created a different bearer, invalidated the previous record, and left exactly one active record before final cleanup. No raw value was persisted as evidence. |
| Revoked private link | Pass | The final active link was revoked through the owner UI. Reopening it showed the explicit revoked state with no plan content; the cloud plan then had zero active share tokens. |
| Duplicate anonymous submission | Pass with environment note | The deployed plan was future-dated, so the date gate correctly rendered no submission form and was not bypassed. The current Web tests and rollback-only SQL suites verify plan/date/visit/task whitelisting, idempotent update behavior, and duplicate prevention. |
| Wrong task/date/visit input | Pass | `anonymous-submission-policy.test.mjs` and the rollback-only access SQL reject values outside the server-derived plan whitelist. Hidden browser fields are not trusted. |
| Durable Audit/Outbox leakage | Pass | Sampled Audit rows used only `expires_at`, `reason`, `revoked_at`, or `task_count` event-data keys. Searches found no bearer URL, token hash, raw token, authorization value, or full note. No correlated Outbox payload was created by page views. |
| PostHog leakage | Pass | The connected project recorded `catcare_share_page_viewed` and `catcare_share_link_created`. The view-event schema contained only bounded correlation/resource/result/context fields; neither event schema exposed raw-token, token-hash, authorization, or bearer properties. Link creation may carry the owner page `current_url`, which is not a bearer route. |
| Evidence/repository leakage | Pass | The committed evidence contains outcomes and safe counts only. A final repository scan is required before publication. |

## Executable Evidence

- Fresh local `supabase db reset` applied all 16 repository migrations through
  `20260709013908_restore_ai_credit_units.sql`.
- Rollback-only SQL scripts passed with `ON_ERROR_STOP=1`:
  `catcare_share_token_security.sql`, `catcare_share_link_management.sql`,
  `catcare_owner_rls.sql`, and `catcare_access_boundary.sql`.
- `@xwlc/platform` tests passed `5/5`.
- Web tests passed `76/76`, including token-state precedence, minimal share
  DTO, anonymous whitelist/date/visit validation, idempotent submission,
  Audit/Outbox redaction, and required-effect repair.
- Full repository typecheck, lint, test, build, boundary, diff, and secret
  checks remain the publication gate after this document is stable.

`supabase test db` is not the command used for these four scripts because they
are rollback-only assertion scripts rather than pgTAP files. Running each file
through `psql` with `ON_ERROR_STOP=1` is the repository-compatible success
criterion.

## Architecture And Foundation Judgment

The split is appropriate for XWLC and a second product:

- `@xwlc/platform` owns runtime-neutral actor, capability-context, share-gate,
  token-state, and safe telemetry-envelope contracts. A Travel product can
  consume these public contracts without importing CatCare objects.
- The application layer owns bearer extraction, authenticated owner lookup,
  token storage, resource queries, and server actions. A future Hono/Cloudflare
  adapter must reproduce the same explicit owner/resource/scope filters even
  when no Supabase RLS layer exists.
- CatCare keeps its care-plan DTO, task/date/visit whitelist, submission rules,
  Audit event names, Outbox destination, and product copy. These are not
  generic platform APIs.
- RLS is defense in depth, not the portable contract. The reusable invariant is
  the explicit actor plus owner/resource/scope context and a minimal response
  projection at every adapter boundary.

This is a suitable, not artificially small, foundation cut: Travel can reuse
the gate state machine, safe context/envelope, negative matrix, and adapter
acceptance contract. It must supply its own product store, DTO, route adapter,
and whitelist. The pure Outbox worker state machine and deterministic Audit ID
helper should be extracted only when Travel becomes the second real consumer;
the current Supabase store and CatCare event types should remain app-local.

## Boundaries And Remaining Work

- GNE-270 does not prove exact cloud migration-history parity. `GNE-271` owns
  repository-to-cloud reconciliation and the formal clean-database rehearsal
  conclusion.
- The deployed duplicate-submit UI path was not executable because the chosen
  plan was future-dated. This is not a security gap: the date gate worked, and
  executable unit plus SQL evidence covers the mutation boundary. A later
  time-valid runbook may add browser evidence without changing the contract.
- No true production database, live payment, real AI provider, or production
  secret operation was performed.
- Passing GNE-270 is input to `GNE-273`; it is not the final v0.3.0 release
  decision by itself.

## Acceptance

- Security negative matrix: pass.
- Evidence hygiene: pass, subject to final pre-publication scan.
- Common-foundation portability: pass at contract and acceptance-matrix level.
- Runtime/package extraction: intentionally deferred until a second real
  consumer demonstrates the stable seam.
- Parent/sequence gate: stop after GNE-270; do not close `GNE-234` and do not
  enter `GNE-271` automatically.
