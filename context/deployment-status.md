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
| Latest production status | partial smoke pass for PostHog production event reception and required shared properties; full Production Smoke Path not recorded |
| Latest production URL | `https://ai-web-starter-kit-web.vercel.app` |
| Latest production commit | unknown |
| Latest preview status | unknown |
| Latest preview URL | unknown |
| Latest preview commit | unknown |
| Environment variable split | Vercel Production and Preview should be separate entries. Values may temporarily match while only one provider environment exists. |
| Current blocked items | No current `ANALYTICS-06` blocker recorded. Full Production Smoke Path is still not recorded in this file. AI production smoke is `not_run` until a real provider is configured and deployed. The current live Production deployment was observed before the region change and still reported Vercel Function region `iad1`; the `sin1` config is not live until merged and redeployed. |
| Next owner action | Before online release, verify Supabase Auth URL configuration, apply any missing reviewed Supabase migrations to the target project, confirm Vercel Production env entries, merge and redeploy the Vercel Function region config, verify the next deployment reports `regions=["sin1"]`, then run the full Production Smoke Path. |

GNE-182 provider selector and server-only key names are documented in `context/environment-matrix.md`. This file records configured/missing/unknown status only when an actual deployment or env dashboard verification is performed.

## Status Values

- `pass`: verified successfully with evidence.
- `fail`: verified and failed with a concrete symptom.
- `blocked`: cannot be verified until an owner action, permission, provider setup, or missing fact is resolved.
- `not_run`: intentionally not run yet.
- `unknown`: existing state is not known and no verification was attempted.

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

No Production deployment result has been recorded in this file yet.

## Latest Preview Deployment

No Preview deployment result has been recorded in this file yet.

## Production Smoke Path

No full Production Smoke Path has been recorded in this file yet. AI production
smoke is also not recorded as passed; GNE-160 defines the repository-level
checklist and budget guard only.

## Current Release Configuration Notes

- Supabase Auth Site URL for production should be `https://ai-web-starter-kit-web.vercel.app`.
- Supabase Redirect URLs should include production `/auth/confirm` and any exact local or Preview callback URLs used by reviewers.
- Vercel Production should use `NEXT_PUBLIC_APP_URL=https://ai-web-starter-kit-web.vercel.app` and `NEXT_PUBLIC_APP_ENV=production`.
- Vercel Production should keep `PAYMENT_PROVIDER=sandbox`, `PAYMENT_MODE=sandbox`, and `PAYMENT_LIVE_ENABLED=false` for normal MVP2 release verification.
- Creem may be enabled only for controlled `GNE-100` test-mode verification, with test secrets server-only and `PAYMENT_LIVE_ENABLED=false`.
- Required repository migrations include the Payment events migration and the Billing entitlement source-idempotency migration. The target Supabase project migration history must be checked before release.
- Vercel environment variable changes require a new deployment before the changed values can be verified.
- Vercel Functions should run in `sin1` while the current Supabase project is in `ap-southeast-1`. Verify the next Production deployment reports `regions=["sin1"]` before treating the region alignment as passed.

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
