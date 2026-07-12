# MVP3 Reviewer Baseline

## Purpose

This document is the safe, reproducible entry point prepared by `GNE-268` for
the later `GNE-234 VERIFY` run. It records roles, setup methods, URLs, versions,
data expectations, and known gaps without storing passwords, raw share tokens,
private care text, provider secrets, or customer data.

The baseline identifies evidence. It does not replace the 30-minute runbook,
security-negative verification, deployment smoke, or the final v0.3.0 decision.

## Baseline Snapshot

Snapshot time: 2026-07-12 (Asia/Shanghai).

| Evidence | Baseline |
| --- | --- |
| Stable validation URL | `https://ai-web-starter-kit-web.vercel.app` |
| Stable URL check | `pass`: `/` returned HTTP 200 on 2026-07-12 |
| Vercel deployment target | Vercel labels the automatic `main` deployment as `Production`; for MVP3 the connected Supabase and PostHog resources remain reference/staging/test resources, not a true production data environment |
| Deployed commit | `1c2de2c6ab8f414279220031e7d5dd27563bfc3f` |
| Deployment result | `pass`: GitHub deployment status and Vercel commit status both reported success |
| Function region observation | `pass`: stable URL response included Vercel region `sin1` |
| GitHub CI | `pass`: `checks` completed successfully for the deployed commit |
| Shared Preview | `not_run`: PR branches do not automatically receive Preview deployments in the current Hobby/private-repository setup; a Preview is not required for this baseline |
| True production Supabase | `not_run`: not enabled during MVP3 |

The generated deployment URL is Vercel-auth protected. Reviewers should use the
stable validation URL above unless the Repo Owner explicitly provides access to
the generated deployment URL.

Reviewer entry paths on the stable host:

| Purpose | Path |
| --- | --- |
| Product landing | `/` |
| Owner sign-in | `/login?next=/catcare` |
| Owner workspace | `/catcare` |
| Billing plan and order evidence | `/account/billing` |
| AI Credit and usage evidence | `/account/usage` |
| Anonymous handoff | `/s/<redacted>`; full link is handed off privately |

## Reviewer Identities

Use these aliases in evidence. Never replace them with a real email, password,
session cookie, OTP, OAuth code, or user UUID in Git, Linear, screenshots, or
PostHog.

| Alias | Required identity | Credential handoff | Required state |
| --- | --- | --- | --- |
| `reviewer-owner-a` | A reviewer-controlled, verified Supabase Auth account | Password manager or another private channel controlled by the Repo Owner | Owns the primary CatCare test data |
| `reviewer-owner-b` | A different reviewer-controlled, verified Supabase Auth account | Password manager or another private channel controlled by the Repo Owner | Must not own or be granted access to owner A data |
| `reviewer-anonymous` | Signed-out browser context | No account credential | Receives one active private share URL out of band |

If two accessible reviewer-controlled accounts are not already available,
create them through the normal `/login` signup flow with two independent test
mailboxes. Do not use an Admin-created account as product-flow evidence unless
the evidence explicitly labels that shortcut. Account existence alone is not a
cross-owner test; `reviewer-owner-b` must use a separate authenticated session.

The repository deliberately does not contain account credentials. A handoff is
ready only after the Repo Owner confirms both aliases can be resolved through a
private credential channel.

## Test Data Contract

Prefix any data created specifically for the final run with `GNE268` so it is
recognizable and can be cleaned without matching unrelated rows.

### Owner A

1. Sign in as `reviewer-owner-a`.
2. Create or select one CatCare cat profile.
3. Create one plan with at least one required task and a service date usable by
   the runbook.
4. Publish the plan.
5. Create one active private link and deliver the full URL only through the
   private reviewer channel.
6. Keep at least one submission/result path available for owner result review.

### Owner B

1. Sign in separately as `reviewer-owner-b`.
2. Create a minimal `GNE268` cat or plan only if the later runbook needs a
   visible owner-B control row.
3. Never reuse owner A's session or private link as owner B authorization.
4. Cross-owner rejection belongs to `GNE-270`; use the existing rollback-only
   SQL acceptance scripts there instead of leaving privileged seed data behind.

### Anonymous actor

1. Open the active owner-A link in a signed-out browser context.
2. Evidence may record `/s/<redacted>` plus a safe hash/fingerprint generated
   for comparison; it must not record the bearer token or full URL.
3. Expired, revoked, and tampered link checks belong to `GNE-270`.

### Cleanup

- Delete only rows created for the run after downstream VERIFY work no longer
  needs them.
- Revoke the run's private link before deleting owner-scoped test data.
- Confirm `GNE268`-prefixed rows are gone without printing private row content.
- Delete temporary Auth users only when they were created solely for this run
  and no later VERIFY task still needs them.

## Current Reference/Test Data Observation

A read-only aggregate query against the connected Supabase reference/staging/test
project on 2026-07-12 returned:

| Safe aggregate | Count |
| --- | ---: |
| Auth users | 7 |
| Owners with CatCare cat rows | 1 |
| Cats | 2 |
| Care plans | 4 |
| Care tasks | 77 |
| Care submissions | 24 |
| Active share tokens | 3 |
| Revoked share tokens | 12 |
| Paid sandbox/test orders | 26 |
| Active entitlements | 9 |
| Committed usage rows | 38 |
| Credit ledger rows | 74 |

This proves the reference environment contains the needed data categories, but
it does not prove two accessible reviewer accounts are ready. Only one owner
currently owns CatCare cat rows, so owner B data must be created on demand or
verified through the rollback-only owner-isolation scripts during `GNE-270`.

## Billing And AI Modes

| Capability | Baseline mode | Trusted evidence | Boundary |
| --- | --- | --- | --- |
| Billing/Payment | sandbox/test only | Server-side order, entitlement, credit, and usage rows | A result URL alone is not payment or entitlement proof |
| AI | mock/no-op/sandbox contract | Server-side gate result and usage status | Live provider quality and cost are not MVP3 acceptance conditions |
| PostHog | One project, separated by safe shared properties | Event name plus safe properties and correlation evidence | PostHog is observational, never the business source of truth |

Real payment, settlement, refund, live AI calls, and production provider cost
are `not_run` and are not authorized by this baseline.

## Package Version Baseline

| Workspace | Version |
| --- | --- |
| Repository root `ai-web-starter-kit` | `0.1.0` |
| `@xwlc/web` | `0.1.0` |
| `@xwlc/core` | `0.1.1` |
| `@xwlc/db` | `0.1.1` |
| `@xwlc/platform` | `0.1.1` |
| `@xwlc/ui` | `0.1.1` |

The CatCare package-consumption checkpoint reports the logical schema contract
as `catcare-mvp3`. This contract label is not a substitute for Supabase
migration-history parity.

## Schema And Migration Baseline

Repository migration range:

- first: `20260618070613_create_data_template.sql`;
- latest: `20260709013908_restore_ai_credit_units.sql`;
- count: 16 migration files.

The connected reference/staging/test project reported 11 migration-history
rows, from `20260618070613_create_data_template` through
`20260708124436_add_outbox_idempotency_key`.

Observed parity status: `fail` for exact migration-history parity.

- The remote history did not list repository versions `20260703050143`,
  `20260703155601`, `20260704033000`, `20260704043000`, or
  `20260709013908`.
- The share-token migration is recorded remotely as `20260707022833`, while
  the repository file is `20260707012636_create_catcare_share_tokens.sql`.
- Runtime tables and aggregate test data are present, but their presence does
  not repair or explain migration-history drift.

Do not apply, rename, or rewrite migrations during VERIFY-01. `GNE-271` must
reconcile repository files, remote migration history, and runtime schema before
the final v0.3.0 decision claims repeatable database upgrades.

## Not Run And Handoff Gates

| Item | Status | Reason / next owner |
| --- | --- | --- |
| Full 30-minute Reviewer Runbook | `not_run` | Owned by `GNE-269` |
| Cross-owner and token negative matrix | `not_run` | Owned by `GNE-270` |
| Package patch and migration rehearsal | `not_run` | Owned by `GNE-271`; must include the parity finding above |
| Consolidated provider evidence | `not_run` | Owned by `GNE-272` |
| Full deployed product smoke | `not_run` | Owned by `GNE-250` |
| Live AI and live payment | `not_run` | Explicitly outside MVP3 |
| True production database verification | `not_run` | No true production Supabase project exists in MVP3 |

Before the later runbook begins, the Repo Owner must privately confirm access
to owner A and owner B and privately hand off one active share link. That
handoff must not be copied into this file or Linear.
