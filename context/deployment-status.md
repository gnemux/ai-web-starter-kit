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
| Latest production status | unknown |
| Latest production URL | unknown |
| Latest production commit | unknown |
| Latest preview status | unknown |
| Latest preview URL | unknown |
| Latest preview commit | unknown |
| Environment variable split | Vercel Production and Preview should be separate entries. Values may temporarily match while only one provider environment exists. |
| Current blocked items | unknown |
| Next owner action | Run and record GNE-108 deployment entry verification, then continue GNE-185 and GNE-186. |

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
| NEXT_PUBLIC_APP_URL | configured / missing / unknown | configured / missing / unknown | URL may be temporary for Preview. |
| NEXT_PUBLIC_SUPABASE_URL | configured / missing / unknown | configured / missing / unknown | Public URL only. |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | configured / not_used / missing / unknown | configured / not_used / missing / unknown | Do not create an empty Vercel entry. |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | configured / not_used / missing / unknown | configured / not_used / missing / unknown | Legacy public browser key fallback. |
| NEXT_PUBLIC_POSTHOG_KEY | configured / missing / unknown | configured / missing / unknown | Public analytics project key. |
| NEXT_PUBLIC_POSTHOG_HOST | configured / missing / unknown | configured / missing / unknown | Default US host unless project differs. |
| SUPABASE_SECRET_KEY | not_required / configured / missing / unknown | not_required / configured / missing / unknown | Server-only. Do not record value. |
| SUPABASE_SERVICE_ROLE_KEY | not_required / configured / missing / unknown | not_required / configured / missing / unknown | Server-only. Do not record value. |

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

No full Production Smoke Path has been recorded in this file yet.

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
