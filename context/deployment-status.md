# Deployment Status Memory

## Purpose

This file is the repository-owned memory for deployment status, smoke test results, known issues, rollback notes, and next actions.

Use it when any of these happen:

- Production deployment from `main`.
- Repo Owner manually creates a Vercel Preview deployment from a PR branch or commit SHA.
- Vercel environment variables change.
- Supabase or PostHog production verification is run.
- Production Smoke Path is run.
- Deployment fails, is blocked, or is rolled back.

Do not record secrets, real private tokens, service-role keys, passwords, customer data, raw provider payloads, OTPs, OAuth codes, or session cookies.

## Current Summary

| Field | Current value |
| --- | --- |
| Latest production status | automatic main deployment for `c4fcaaa` succeeded; fresh signed-out Google login passed on the first click and returned as the selected Gmail identity |
| Latest production URL | `https://ai-web-starter-kit-web.vercel.app` |
| Latest production commit | `c4fcaaa9d7018b157562efb0bfdc5e47f8efc41b` |
| Latest preview status | unknown |
| Latest preview URL | unknown |
| Latest preview commit | unknown |
| Environment variable split | Vercel Production and Preview should be separate entries. Values may temporarily match while only one provider environment exists. |
| Current blocked items | Apple OAuth provider setup and real Apple-user smoke are explicitly deferred/`not_run`; Google public access remains limited while its consent screen is in Testing. Live AI/payment, real Outbox delivery, and separate production providers remain `not_run`. |
| Next owner action | Close GNE-321 and GNE-317 with the recorded evidence, then stop. Do not enter another Issue automatically. |

GNE-182 provider selector and server-only key names are documented in `context/environment-matrix.md`. This file records configured/missing/unknown status only when an actual deployment or env dashboard verification is performed.

## Status Values

- `pass`: verified successfully with evidence.
- `fail`: verified and failed with a concrete symptom.
- `blocked`: cannot be verified until an owner action, permission, provider setup, or missing fact is resolved.
- `not_run`: intentionally not run yet.
- `unknown`: existing state is not known and no verification was attempted.

## 2026-07-18 22:25 CST - GNE-317 closeout deployment smoke found recoverable stale-session defect

### Deployment Metadata

| Field | Value |
| --- | --- |
| Linear issue | `GNE-321` / `GNE-317` |
| Environment | Vercel automatic `main` target with the single shared reference/staging/test Supabase project |
| Deployment type | automatic `main` deployment plus deployed Auth smoke |
| Trigger | PR #112 merge commit |
| Branch | `main` |
| Commit | `5358a816c7027e790b18336a53eb17ecca15483c` |
| Vercel URL | `https://ai-web-starter-kit-web.vercel.app` |
| Actor | Codex / Sol under explicit user approval |
| Verifier | Codex / Sol with independent review |
| Provider values | unchanged |
| Notes | No provider, database, migration, identity-linking, Apple, secret, payment, or production-data setting changed. |

### Smoke Test Result

| Check | Status | Evidence | Next action |
| --- | --- | --- | --- |
| Vercel deployment | pass | GitHub Vercel status reported the `5358a81` deployment completed. | None for deployment health. |
| Login provider state | pass | Deployed login exposed Google and kept Apple visibly disabled. | Keep the same boundary. |
| Google first click with stale browser session | fail | The first start returned the localized provider-unavailable state; the same response cleared the invalid refresh cookie and a second click reached Google and returned as the selected Google identity. | Accept only explicit stale-session errors as recoverable, keep unknown errors fail-closed, redeploy and repeat first-click smoke. |
| Account isolation | pass | The selected Google identity remained distinct from the previous different-email password identity; no automatic linking was introduced. | Preserve this invariant in the repair. |
| Clean-template projection | blocked | The merged candidate includes the earlier neutral Auth contract, but this newly reproduced first-click state is not yet projected and revalidated. | Project the neutral recovery rule, regenerate deterministically, and rerun the candidate gates after the repair merge. |

### Rollback Plan

- Rollback was not required because the deployed product remains usable after
  stale-cookie cleanup and no committed data or schema operation was affected.
- Closure is blocked until a forward code repair passes CI, deployment, first-
  click Google smoke, deterministic candidate generation, and candidate gates.

## 2026-07-18 23:25 CST - GNE-321 stale-session repair and GNE-317 final candidate acceptance

### Deployment Metadata

| Field | Value |
| --- | --- |
| Linear issue | `GNE-321` / `GNE-317` |
| Environment | Vercel automatic `main` target with the single shared reference/staging/test Supabase project |
| Deployment type | automatic `main` deployment, deployed Auth smoke and local clean-candidate acceptance |
| Trigger | PR #113 merge commit |
| Branch | `main` |
| Commit | `c4fcaaa9d7018b157562efb0bfdc5e47f8efc41b` |
| Vercel URL | `https://ai-web-starter-kit-web.vercel.app` |
| Actor | Codex / Sol under explicit user approval |
| Verifier | Codex / Sol with two-pass independent review |
| Provider values | unchanged |
| Notes | No provider, database, migration, identity-linking, Apple, secret, payment, or production-data setting changed. |

### Smoke Test Result

| Check | Status | Evidence | Next action |
| --- | --- | --- | --- |
| GitHub CI | pass | PR #113 run `29648588890` completed lint, typecheck, tests and build successfully. | Track the separate GitHub Actions Node runtime deprecation warning outside this functional closeout. |
| Vercel deployment | pass | GitHub Vercel status reported `Deployment has completed` for `c4fcaaa` at 23:25 CST. | None. |
| Google first click | pass | After an explicit UI sign-out, one click on the deployed Google control completed OAuth and landed on `/catcare`; no intermediate provider-unavailable state appeared. | None for controlled acceptance. |
| Selected identity and account isolation | pass | The resulting account menu displayed the selected Gmail identity. Different-email password and Google accounts were not linked or merged. | Preserve the regression contract. |
| Apple boundary | not_run | Apple stayed visibly disabled and no Apple provider or real-user operation was attempted. | Collaborator-owned follow-up after Apple Developer ownership exists. |
| Google public availability | blocked | The Google consent screen remains in Testing, so controlled test users can authenticate but unrestricted public availability is not claimed. | Publish the Google consent screen only under a separate explicit provider-release decision. |
| Clean-template candidate | pass | Candidate `0.2.0-candidate.11` was generated twice from `c4fcaaa`; identical tree hash `5ec5c6ecb0b6b360f6527fccc0684f74131d65e098cb9398adca08e8cdb583de`. Frozen install, three-layer verification, 24 neutral platform tests, full tests, typecheck, lint and build passed. | Keep one local final candidate; do not push template repositories without a separate explicit request. |

### Rollback Plan

- Rollback is not required: deployment, first-click OAuth, account isolation and
  the final clean-candidate gates passed.
- If stale-session behavior regresses, preserve the three-code allowlist, keep
  unknown provider failures fail-closed, and repair forward through a reviewed
  PR. Do not weaken account isolation or manually edit Auth identities.

## 2026-07-17 14:55 CST - GNE-320 deployed notification revision acceptance

### Deployment Metadata

| Field | Value |
| --- | --- |
| Linear issue | `GNE-320` |
| Environment | Vercel automatic `main` target with the single shared reference/staging/test Supabase project |
| Deployment type | automatic `main` deployment plus approved staging migration and deployed smoke |
| Trigger | PR #109 merge commit |
| Branch | `main` |
| Commit | `8a46d16dc9f5f4601ab22d40727752c1a8cc0352` |
| Vercel URL | `https://ai-web-starter-kit-web.vercel.app` |
| Actor | Codex / Sol under explicit user approval |
| Verifier | Codex / Sol with prior independent code review |
| Provider values | same-as-current-single-service |
| Notes | No provider configuration changed. No real user data, raw share token, secret, live payment, or live AI operation was used. |

### Smoke Test Result

| Check | Status | Evidence | Next action |
| --- | --- | --- | --- |
| GitHub CI | pass | Run `29560464698` completed successfully for merge commit `8a46d16`. | None |
| Vercel deployment | pass | GitHub Vercel status reported `Deployment has completed` for the merge commit. | None |
| Supabase migration | pass | Remote history matches through `20260717150000`; both revision columns and the restricted security-invoker RPC are present. | None |
| Meaningful sitter update | pass | A synthetic exception-note edit advanced submission and notification revision 1 -> 2, reopened one unread notification, and updated its ordering without creating a third notification. | None |
| Notification read persistence | pass | Opening the updated notification cleared unread state; refresh preserved zero unread. | None |
| Identical retry | pass | A second save with identical status/note kept both revisions at 2, notification count at 2, unread at 0, and `last_notified_at` unchanged. | None |
| Notification UI | pass | Desktop/mobile anchoring, bounded scrolling, exception hierarchy, and current information density are acceptable. | Consider grouping/filtering only after materially larger inbox volume. |
| Synthetic cleanup | pass | Latest private link revoked; synthetic plan closed; two submissions and two notifications retained as logical history. | None |

### Rollback Plan

- Rollback is not required: the deployed behavior, schema verification, security
  checks, and real synthetic flow passed.
- If a later regression is found, stop notification writes, inspect the stable
  revision/idempotency facts, and use a new forward migration. Do not edit the
  remote schema or migration history manually.

## Deployment Entry Template

Copy this template for Production, Preview, redeploy, rollback, or smoke test updates.

```markdown
## YYYY-MM-DD HH:mm TZ - <production | preview | rollback | smoke-test>

### Deployment Metadata

| Field | Value |
| --- | --- |
| Linear issue | GNE-108 / GNE-185 / GNE-186 / GNE-109 / GNE-110 / GNE-187 / GNE-129 |
| Environment | production / preview |
| Deployment type | automatic main / manual Preview / redeploy / rollback / smoke-test update |
| Trigger | main push / PR branch / commit SHA / Vercel Dashboard / Vercel redeploy |
| Branch | <branch or unknown> |
| Commit | <short SHA or unknown> |
| Vercel URL | <URL or unknown> |
| Actor | <who triggered or recorded it> |
| Verifier | <who verified it> |
| Provider values | same-as-current-single-service / split-provider-envs / unknown |
| Notes | <short notes, no secrets> |

### Provider Configuration Status

Record configured/missing/unknown only. Do not record values.

| Key or provider | Production | Preview | Notes |
| --- | --- | --- | --- |
| NEXT_PUBLIC_APP_ENV | configured / missing / unknown | configured / missing / unknown | production should use `production`; preview should use `preview`. |
| NEXT_PUBLIC_PRODUCT_ID | configured / missing / unknown | configured / missing / unknown | Public product slug for future multi-product separation. |
| NEXT_PUBLIC_APP_URL | configured / missing / unknown | configured / missing / unknown | URL may be temporary for Preview. |
| AUTH_PROVIDER | configured / missing / unknown | configured / missing / unknown | Server-side selector; current value should be `supabase`. |
| DATABASE_PROVIDER | configured / missing / unknown | configured / missing / unknown | Server-side selector; current value should be `supabase`. |
| NEXT_PUBLIC_ANALYTICS_PROVIDER | configured / missing / unknown | configured / missing / unknown | Public selector; current value should be `posthog`. |
| PAYMENT_PROVIDER | configured / missing / unknown | configured / missing / unknown | Server-side selector; current value should be `sandbox`. |
| AI_PROVIDER | configured / missing / unknown | configured / missing / unknown | Server-side selector; current value should be `mock`. |
| EMAIL_PROVIDER | configured / missing / unknown | configured / missing / unknown | Server-side selector; current value should be `noop`. |
| STORAGE_PROVIDER | configured / missing / unknown | configured / missing / unknown | Server-side selector; current value should be `noop`. |
| SMS_PROVIDER | configured / missing / unknown | configured / missing / unknown | Server-side selector; current value should be `noop`. |
| NEXT_PUBLIC_SUPABASE_URL | configured / missing / unknown | configured / missing / unknown | Public URL only. |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | configured / not_used / missing / unknown | configured / not_used / missing / unknown | Do not create an empty Vercel entry. |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | configured / not_used / missing / unknown | configured / not_used / missing / unknown | Legacy public browser key fallback. |
| NEXT_PUBLIC_POSTHOG_KEY | configured / missing / unknown | configured / missing / unknown | Public analytics project key. |
| NEXT_PUBLIC_POSTHOG_HOST | configured / missing / unknown | configured / missing / unknown | Default US host unless project differs. |
| SUPABASE_SECRET_KEY | not_required / configured / missing / unknown | not_required / configured / missing / unknown | Server-only. Do not record value. |
| SUPABASE_SERVICE_ROLE_KEY | not_required / configured / missing / unknown | not_required / configured / missing / unknown | Server-only. Do not record value. |
| PAYMENT_SECRET_KEY | not_required / configured / missing / unknown | not_required / configured / missing / unknown | Server-only. Do not record value. |
| PAYMENT_WEBHOOK_SECRET | not_required / configured / missing / unknown | not_required / configured / missing / unknown | Server-only. Do not record value. |
| AI_PROVIDER_API_KEY | not_required / configured / missing / unknown | not_required / configured / missing / unknown | Server-only. Do not record value. |
| AI_BUDGET_LIMIT | not_required / configured / missing / unknown | not_required / configured / missing / unknown | Server-only. Record status only, not value. |
| EMAIL_PROVIDER_API_KEY | not_required / configured / missing / unknown | not_required / configured / missing / unknown | Server-only. Do not record value. |
| STORAGE_SECRET_ACCESS_KEY | not_required / configured / missing / unknown | not_required / configured / missing / unknown | Server-only. Do not record value. |
| SMS_PROVIDER_API_KEY | not_required / configured / missing / unknown | not_required / configured / missing / unknown | Server-only. Do not record value. |
| SMS_PROVIDER_SECRET | not_required / configured / missing / unknown | not_required / configured / missing / unknown | Server-only. Do not record value. |

### Smoke Test Result

| Check | Status | Evidence | Next action |
| --- | --- | --- | --- |
| Production URL loads | pass / fail / blocked / not_run | <what was observed> | <next step> |
| Homepage | pass / fail / blocked / not_run | <what was observed> | <next step> |
| Login page | pass / fail / blocked / not_run | <what was observed> | <next step> |
| Signup / login / logout | pass / fail / blocked / not_run | <what was observed> | <next step> |
| Session restore | pass / fail / blocked / not_run | <what was observed> | <next step> |
| Dashboard | pass / fail / blocked / not_run | <what was observed> | <next step> |
| Account page | pass / fail / blocked / not_run | <what was observed> | <next step> |
| Supabase Auth | pass / fail / blocked / not_run | <what was observed> | <next step> |
| Demo data / key API | pass / fail / blocked / not_run | <what was observed> | <next step> |
| PostHog production event | pass / fail / blocked / not_run | <event name and safe properties only> | <next step> |
| Browser console | pass / fail / blocked / not_run | <summary only> | <next step> |
| Network 4xx / 5xx | pass / fail / blocked / not_run | <summary only> | <next step> |

### Known Issues

- Issue:
- Impact:
- Owner:
- Status:
- Next action:

### Rollback Plan

- Rollback target:
- Rollback trigger:
- Owner:
- Notes:

### Next Actions

- [ ] Action 1
- [ ] Action 2
```

## Latest Production Deployment

Latest recorded Vercel automatic `main` deployment: 2026-07-13, commit
`55553d3a2270b3405eeb2e1550dbcc521bcdb815`, deployment status `success`.
GitHub CI run `29225628666` also completed successfully. The accepted runtime
repair is commit `82e918794350c53a8bc9a828050420f42e74c86b`; the later commit
publishes its deployed evidence. The stable validation URL returned HTTP 200
from `sin1`, and the GNE-266 rerun received the previously missing PostHog
submission event. Although Vercel labels the target `Production`, MVP3 still
uses reference/staging/test provider resources and has no true production
Supabase project.

## Latest Preview Deployment

No Preview deployment result has been recorded in this file yet.

## Production Smoke Path

The full deployed Reference Product smoke was recorded by GNE-250 on
2026-07-13. The online owner-to-share-to-result path, mock AI, test Billing,
Supabase facts, GitHub CI, Vercel, package versions, and schema parity passed.
That historical run did not observe one fresh PostHog submission event. The
later GNE-266 repair rerun received it with matching trusted correlation
evidence, so the observability concern is closed. This remains an MVP3 online
validation result, not unconditional production readiness. Live-provider AI
smoke remains `not_run`; GNE-160 defines only its checklist and budget guard.

## 2026-07-13 10:12 CST - GNE-250 deployed CatCare smoke

### Deployment Metadata

| Field | Value |
| --- | --- |
| Linear issue | `GNE-250` |
| Environment | Vercel Production target with reference/staging/test providers |
| Deployment type | automatic main plus smoke-test update |
| Trigger | merge to `main` |
| Branch | `main` |
| Commit | `d7bfeb644f3ff7f2ab6a79ceb03fb3de19ff6565` |
| Vercel URL | `https://ai-web-starter-kit-web.vercel.app` |
| Actor | Codex / Sol |
| Verifier | Codex / Sol plus independent Terra review: READY |
| Provider values | same-as-current-single-service |
| Notes | No secrets, raw share token, live payment, live AI, provider reconfiguration, or migration. A synthetic staging-only account/plan supported the independent signed-out link proof. |

### Provider Configuration Status

| Key or provider | Production | Preview | Notes |
| --- | --- | --- | --- |
| NEXT_PUBLIC_APP_ENV | unknown | unknown | Runtime events reported `env=production`; Vercel entry was not inspected. |
| NEXT_PUBLIC_PRODUCT_ID | unknown | unknown | Runtime events included required app/product metadata; Vercel entry was not inspected. |
| NEXT_PUBLIC_APP_URL | unknown | unknown | Stable routes and server-side event URLs were valid; entry source is unknown. |
| AUTH_PROVIDER / DATABASE_PROVIDER | unknown | unknown | Login/session and deployed Supabase writes passed; selector entries were not inspected. |
| NEXT_PUBLIC_ANALYTICS_PROVIDER | unknown | unknown | Fresh PostHog events arrived, with one submission-event concern; entry was not inspected. |
| PAYMENT_PROVIDER / PAYMENT_MODE | unknown | unknown | Runtime pages reported test data and no real charge; entries were not inspected. |
| AI_PROVIDER | unknown | unknown | Plan generation and recap completed in mock mode; entry was not inspected. |
| NEXT_PUBLIC_SUPABASE_URL / public key | unknown | unknown | Browser Auth/data and connected read-only verification passed; values were not inspected. |
| Supabase server key | unknown | unknown | Audit/Outbox/usage writes passed; the entry and value were not inspected. |
| NEXT_PUBLIC_POSTHOG_KEY / host | unknown | unknown | Project 476986 received the fresh event set; entries were not inspected. |

### Smoke Test Result

| Check | Status | Evidence | Next action |
| --- | --- | --- | --- |
| Stable URL / region | pass | HTTP 200; `sin1` | None |
| Owner session and CatCare | pass | Created the GNE-250 cat and reusable routine | None |
| Plan generation / publish | pass | Six tasks, seven executions, published on the deployed URL | None |
| Private-link route / submission | pass | Explicit logout, fresh active `/s/<redacted>` projection, one idempotent submission, `anonymous_token` Audit | Preserve raw-token exclusion |
| Owner result / mock AI recap | pass | 1/6 real result and recap; two committed usage/Credit pairs | None |
| Billing / entitlement | pass in test boundary | 17/65 -> 15/65; no real charge | Keep live payment `not_run` |
| Supabase / migration | pass | Trusted facts agree; 17/17 migrations | No migration needed |
| PostHog | concern | Eight fresh event categories arrived; fresh submission event absent | Carry into GNE-273 decision |
| Browser console | pass | No warning/error messages on tested pages | None |

### Rollback Plan

No rollback is required because no runtime code, schema, provider config, or
deployment setting changed. The evidence-only branch can be closed without
affecting the deployed product if publication fails.

## Current Release Configuration Notes

- Supabase Auth Site URL for production should be `https://ai-web-starter-kit-web.vercel.app`.
- Supabase Redirect URLs should include production `/auth/confirm` and any exact local or Preview callback URLs used by reviewers.
- Vercel Production should use `NEXT_PUBLIC_APP_URL=https://ai-web-starter-kit-web.vercel.app` and `NEXT_PUBLIC_APP_ENV=production`.
- Vercel Production should keep `PAYMENT_PROVIDER=sandbox`, `PAYMENT_MODE=sandbox`, and `PAYMENT_LIVE_ENABLED=false` for normal MVP2 release verification.
- Creem may be enabled only for controlled `GNE-100` test-mode verification, with test secrets server-only and `PAYMENT_LIVE_ENABLED=false`.
- Required repository migrations include the Payment events migration and the Billing entitlement source-idempotency migration. The target Supabase project migration history must be checked before release.
- Vercel environment variable changes require a new deployment before the changed values can be verified.
- Vercel Functions should run in `sin1` while the current Supabase project is in `ap-southeast-1`. The 2026-07-12 stable validation response reported `sin1`; repeat this check during the full GNE-250 smoke before making a final release claim.

## 2026-06-20 19:58 CST - production PostHog event verification

### Deployment Metadata

| Field | Value |
| --- | --- |
| Linear issue | `GNE-105` / `ANALYTICS-06` |
| Environment | production |
| Deployment type | smoke-test update |
| Trigger | User verified PostHog Activity from deployed site |
| Branch | `main` |
| Commit | unknown |
| Vercel URL | `https://ai-web-starter-kit-web.vercel.app` |
| Actor | wangwei |
| Verifier | wangwei |
| Provider values | unknown |
| Notes | PostHog Activity shows production Vercel URL events. No secrets recorded. |

### Provider Configuration Status

Record configured/missing/unknown only. Do not record values.

| Key or provider | Production | Preview | Notes |
| --- | --- | --- | --- |
| NEXT_PUBLIC_POSTHOG_KEY | configured | unknown | Production event reception observed in PostHog. |
| NEXT_PUBLIC_POSTHOG_HOST | configured | unknown | Production event reception observed in PostHog. |
| PostHog Project | configured | unknown | Project name observed as `ai-web-starter-kit`. |

### Smoke Test Result

| Check | Status | Evidence | Next action |
| --- | --- | --- | --- |
| PostHog production pageview | pass | PostHog Activity shows `Pageview` for `https://ai-web-starter-kit-web.vercel.app/account`. | Confirm shared properties on expanded event. |
| PostHog Auth event | pass | PostHog Activity shows `login_started`, `user_logged_in`, and `Identify` on production Vercel URL. | Confirm shared properties on expanded Auth event. |
| PostHog shared properties | blocked | Expanded event screenshot showed production URL and `App version = v0.1`; required shared property set was not fully visible yet. | Search event properties for `app`, `mvp_stage`, `market`, `env`, `version`, and `module`. |
| Full Production Smoke Path | not_run | This entry only records PostHog production event verification. | Run full smoke path separately under `GNE-109` when needed. |

## 2026-06-21 20:41 CST - production PostHog env verification

### Deployment Metadata

| Field | Value |
| --- | --- |
| Linear issue | `GNE-105` / `ANALYTICS-06` |
| Environment | production |
| Deployment type | smoke-test update |
| Trigger | User verified PostHog Activity after Vercel Production env correction and redeploy |
| Branch | `main` |
| Commit | unknown |
| Vercel URL | `https://ai-web-starter-kit-web.vercel.app` |
| Actor | deployment partner / Repo Owner |
| Verifier | wangwei |
| Provider values | same-as-current-single-service |
| Notes | PostHog Activity shows a recent production `Pageview` for `/account` with `env=production`. No secrets recorded. |

### Provider Configuration Status

Record configured/missing/unknown only. Do not record values.

| Key or provider | Production | Preview | Notes |
| --- | --- | --- | --- |
| NEXT_PUBLIC_APP_ENV | configured | unknown | Production event now reports `env=production`. |
| NEXT_PUBLIC_POSTHOG_KEY | configured | unknown | Production event reception observed in PostHog. |
| NEXT_PUBLIC_POSTHOG_HOST | configured | unknown | Production event reception observed in PostHog. |
| PostHog Project | configured | unknown | Project observed through PostHog Activity. |

### Smoke Test Result

| Check | Status | Evidence | Next action |
| --- | --- | --- | --- |
| PostHog production pageview | pass | PostHog Activity shows a recent `Pageview` for `https://ai-web-starter-kit-web.vercel.app/account`. | None for `ANALYTICS-06`; full smoke path remains separate. |
| PostHog shared properties | pass | Visual checks across expanded production events show `app`, `mvp_stage`, `market`, `module`, version label, and the corrected `env=production`. | Use the same shared property checks for future Preview / Production events. |
| Full Production Smoke Path | not_run | This entry only records PostHog production analytics evidence. | Run full smoke path separately under `GNE-109` when needed. |

## 2026-06-22 21:59 CST - AI deploy-readiness checklist

### Deployment Metadata

| Field | Value |
| --- | --- |
| Linear issue | `GNE-160` / `AI-09` |
| Environment | production |
| Deployment type | smoke-test update |
| Trigger | Repository-level AI deploy readiness implemented locally |
| Branch | `codex/split-account-billing-usage` |
| Commit | unknown |
| Vercel URL | `https://ai-web-starter-kit-web.vercel.app` |
| Actor | Codex |
| Verifier | Codex local checks only |
| Provider values | unknown |
| Notes | Real provider is not configured. No secrets recorded. Production smoke remains `not_run`. |

### Provider Configuration Status

Record configured/missing/unknown only. Do not record values.

| Key or provider | Production | Preview | Notes |
| --- | --- | --- | --- |
| AI_PROVIDER | unknown | unknown | Production can stay `mock`/`noop` until a real provider issue changes the boundary. |
| AI_MODEL | unknown | unknown | Server-only model selector. |
| AI_PROVIDER_API_KEY | not_required | not_required | Not required for MVP2 mock/no-op. Future real provider values must stay server-only. |
| AI_BUDGET_LIMIT | unknown | unknown | Optional server-only single-request Credit cap; configure before real provider smoke. |

### Smoke Test Result

| Check | Status | Evidence | Next action |
| --- | --- | --- | --- |
| AI env key inventory | pass | `.env.example`, `context/environment-matrix.md`, and `integrations/ai.md` list AI server-only key names without values. | Configure Vercel entries by key name when a real provider is selected. |
| AI provider secret exposure | pass | Repository checks keep AI provider secret names server-only and placeholders empty. | Re-run `npm run test:ai-safety` before PR handoff. |
| AI budget guard | pass | Server AI service now blocks above `AI_BUDGET_LIMIT` before provider creation or Credit ledger writes. | Set a numeric cap before real provider smoke. |
| Workspace AI low-cost request | not_run | No deployed real-provider AI request was run. | After provider configuration and redeploy, sign in and submit one low-cost `/dashboard` AI request. |
| AI Credit record | not_run | No deployed real-provider AI request was run. | Verify `/account/usage` after the deployed request. |
| AI analytics event | not_run | No deployed real-provider AI request was run. | Verify safe `ai_request_*` event properties in analytics. |
| Rollback readiness | pass | Default rollback plan remains Vercel rollback/redeploy plus env restore; no schema change in GNE-160. | Record target deployment if a real smoke fails. |

## Known Issues

No deployment known issues have been recorded in this file yet.

## Rollback Plan

Default MVP1 rollback path:

1. Identify the last known good Vercel Production deployment.
2. If the issue is deployment-only, use Vercel Dashboard rollback or redeploy the last known good commit.
3. If the issue involves environment variables, restore the previous Vercel environment entries and redeploy.
4. If the issue involves Supabase schema, stop and follow `context/supabase-workflow.md`; do not edit production schema manually from a dashboard.
5. Record the rollback URL, commit, time, and verification result in this file.

## AI Update Protocol

When asked to record or recall deployment state, AI must:

1. Read `specs/deploy/engineering-spec.md`.
2. Read this file and summarize the latest remembered state first.
3. Ask for missing facts or mark them `unknown` / `blocked`.
4. Update only facts provided by the user or verified through approved tools.
5. Never write secrets or private provider values.
6. Preserve prior entries and append dated updates.
7. Suggest a Linear comment when a deploy issue can move forward.
