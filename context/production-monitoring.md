# Production Monitoring Checklist

## Purpose

This file defines the minimum MVP1 production monitoring and troubleshooting checklist. It gives Repo Owner, collaborators, and AI agents a shared place to remember where to look when production behavior changes.

MVP1 only requires check entry points and responsibility placeholders. It does not require a full observability platform, automatic alert bot, or paging system.

## Required MVP1 Checks

| Signal | Owner | Where to inspect | Expected result | If failed | Required now |
| --- | --- | --- | --- | --- | --- |
| Vercel deployment status | Repo Owner | Vercel Project -> Deployments | Latest `main` Production deployment is ready. | Open deployment details, inspect build logs, record failure in `context/deployment-status.md`. | yes |
| Vercel build errors | Repo Owner / developer | Vercel deployment -> Build Logs | No blocking build errors. | Compare with local `pnpm build`, check root directory and env vars, record blocked reason. | yes |
| Vercel runtime errors | Repo Owner / developer | Vercel deployment logs or runtime logs | No repeated server/runtime errors on MVP1 paths. | Capture safe error summary, affected route, and next owner action. | yes |
| Environment variable missing errors | Repo Owner | Vercel env settings, deployment logs, app-visible configuration errors | Required key names are configured for target environment. | Record missing key names only, not values; update Vercel env and redeploy. | yes |
| Production URL loads | Repo Owner | Browser | Production URL opens without a blocking error. | Check deployment status, DNS/domain, Vercel logs, and browser network summary. | yes |
| Browser console errors | Repo Owner / reviewer | Browser DevTools Console | No obvious blocking console errors on smoke path. | Record safe summary and affected page. | yes |
| Network 4xx / 5xx | Repo Owner / reviewer | Browser DevTools Network, Vercel logs | No unexpected 4xx/5xx on key MVP1 paths. | Record endpoint path, status class, and safe symptom. | yes |
| Supabase Auth health | Repo Owner / Supabase Maintainer | App login/signup path, Supabase Dashboard Auth logs when needed | Signup/login/session behavior matches expected project setting. | Check redirect URLs, public keys, Auth settings, and provider logs. | yes |
| Supabase Database health | Supabase Maintainer | Supabase Dashboard, app dashboard data path | Required tables and RLS-backed reads/writes work for MVP1 paths. | Verify migration state and RLS; do not edit schema manually in production. | yes |
| Supabase RLS / permission errors | Developer / Supabase Maintainer | App service error, Supabase logs, RLS policy review | Owner-only and public-read behavior matches specs. | Record safe error category and follow `context/supabase-workflow.md`. | yes |
| PostHog production pageview | Repo Owner / Analytics Owner | PostHog Activity | Production URL event appears, not localhost. | Check Vercel env, host/key, redeploy timing, browser blockers. | yes |
| PostHog Auth event | Repo Owner / Analytics Owner | PostHog Activity | Auth event has safe shared properties and `env=production`. | Check instrumentation, env vars, login path, and browser blockers. | yes |
| Signup / login failure rate | Repo Owner / Auth Owner | Manual smoke test, Supabase Auth logs, PostHog safe failure events | No unexpected repeated failures during smoke test. | Record failure category only; do not record passwords, OTPs, cookies, or raw payloads. | yes |

## Reserved Future Checks

| Signal | Future owner | MVP stage | Notes |
| --- | --- | --- | --- |
| Payment webhook failures | Payment Owner | MVP2 | Not an MVP1 deploy blocker until real payment provider exists. |
| Email delivery failures | Email / Ops Owner | MVP3 or later | Reserved until an email provider is selected. |
| AI provider errors and budget limits | AI Owner | MVP2 | Tracked under AI provider and cost tasks, not MVP1 Deploy. |
| China analytics events | Analytics Owner | MVP4 | Reserved for China-friendly analytics provider. |
| China cloud deployment health | Ops Owner | MVP4 | Reserved for overseas / China dual-mode infrastructure. |
| Automated alert routing | Ops Owner | Later | MVP1 uses manual checks and documented owner placeholders. |

## Incident Record Template

```markdown
## YYYY-MM-DD HH:mm TZ - <short incident title>

| Field | Value |
| --- | --- |
| Environment | production / preview |
| Severity | low / medium / high / unknown |
| Detected by | person / AI / provider |
| First symptom | <safe summary> |
| Affected paths | <routes or provider areas> |
| Current status | investigating / mitigated / resolved / blocked |
| Owner | <owner> |

### Checks

| Signal | Status | Evidence | Next action |
| --- | --- | --- | --- |
| Vercel deployment | pass / fail / blocked / not_run | <summary> | <next step> |
| Vercel runtime logs | pass / fail / blocked / not_run | <summary> | <next step> |
| Supabase Auth | pass / fail / blocked / not_run | <summary> | <next step> |
| Supabase Database / RLS | pass / fail / blocked / not_run | <summary> | <next step> |
| PostHog production events | pass / fail / blocked / not_run | <summary> | <next step> |
| Browser console / network | pass / fail / blocked / not_run | <summary> | <next step> |

### Resolution

- Cause:
- Fix:
- Verification:
- Follow-up:
```

## AI Recall And Monitoring Protocol

When the user asks about production health, monitoring, alerts, or an incident, AI must:

1. Read `specs/deploy/engineering-spec.md`.
2. Read this file and `context/deployment-status.md`.
3. Summarize the latest known production status and any known issues.
4. Use the checklist above to ask for or record facts.
5. Record missing access as `blocked` instead of guessing.
6. Never request or store secret values in repository docs or Linear comments.
