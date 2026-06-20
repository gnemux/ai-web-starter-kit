# Engineering Spec: Deploy Operations Memory And AI Automation

## Scope

Create repository-owned deploy operations memory for:

- `GNE-110`: deployment status writeback and troubleshooting record.
- `GNE-187`: minimum production monitoring and alerting checklist.
- `GNE-129`: multi-environment and multi-product configuration reservation.

This is a documentation and process automation change. It does not change runtime application behavior or external provider resources.

## Affected Areas

- `AGENTS.md`
- `context/codex-rules.md`
- `context/deployment-status.md`
- `context/production-monitoring.md`
- `context/environment-matrix.md`
- `context/status.md`
- `integrations/vercel.md`
- `specs/deploy/*`

## Architecture

Deploy memory has three layers:

```text
Linear task or deployment event
-> AI recall rules in specs/deploy/engineering-spec.md
-> operational memory documents under context/
-> Linear / PR / status summary
```

The memory documents have separate responsibilities:

- `context/deployment-status.md`: latest deploy summary, smoke test status, known issues, rollback plan, and verification history.
- `context/production-monitoring.md`: minimum MVP1 checks, provider dashboards, expected signals, and failure actions.
- `context/environment-matrix.md`: naming and isolation rules for local / preview / production and future products.

## AI Automation Triggers

AI must apply this spec when the user mentions any of the following:

- Production deployment, Preview deployment, Vercel deployment, redeploy, rollback, or manual Preview.
- Production Smoke Path, smoke test, online acceptance, go-live, release verification, or deploy verification.
- Environment variables, Preview / Production parameter isolation, Supabase / PostHog deployment configuration.
- Production monitoring, alerting, runtime logs, Vercel logs, Supabase Auth health, PostHog production events.
- Multi-environment, multi-product, Product Validation Kit, market split, overseas / China mode, staging, or production provider split.
- Linear issues `GNE-110`, `GNE-187`, `GNE-129`, or parent `GNE-74`.

## AI Required Read Order

For any triggered task, AI must read:

1. `AGENTS.md`
2. `context/status.md`
3. `context/codex-rules.md`
4. `specs/deploy/product-spec.md`
5. `specs/deploy/engineering-spec.md`
6. The relevant deploy memory document:
   - `context/deployment-status.md` for deployment or smoke test events.
   - `context/production-monitoring.md` for monitoring or incident checks.
   - `context/environment-matrix.md` for environment or product configuration questions.
7. Relevant provider docs:
   - `integrations/vercel.md` for deployments and Vercel envs.
   - `integrations/supabase.md` for Supabase Auth, database, or RLS behavior.
   - `integrations/analytics.md` for PostHog event verification.
   - `context/supabase-workflow.md` if schema, RLS, Auth, Storage, Realtime, or database-backed behavior changes.

## AI Recall Rules

Before updating anything, AI must summarize the currently remembered state from the relevant context document:

- Latest Production URL, commit, status, and smoke test result when available.
- Latest Preview URL, commit, status, and whether it was manually created.
- Current environment split rule, including whether Preview and Production values are temporarily identical.
- Current blocked items and next actions.

If the document has no record yet, AI must say that no recorded state exists and ask for or mark missing facts explicitly.

## AI Writeback Rules

When the user provides a deployment result, smoke test result, monitoring observation, incident, rollback, or environment change, AI should update repository memory if the workspace is on a suitable task branch.

Required writeback behavior:

- Use `pass`, `fail`, `blocked`, or `not_run`; do not invent success.
- Include environment, URL if available, commit, date/time, actor, verifier, and evidence summary when provided.
- Do not write real secret values, full private tokens, passwords, service-role keys, customer data, or sensitive request payloads.
- For environment variables, record key names and configured/missing/unknown status only, not values.
- For PostHog, record event names and expected safe shared properties, not raw user secrets or provider payloads.
- For Supabase, record project role such as local/staging/production and visible symptom, not service-role keys or database passwords.
- If information is incomplete, write `blocked` with the missing fact and next owner action.
- Preserve prior history. Add dated entries instead of overwriting evidence.
- Update `context/status.md` only when the change materially affects project progress, deployment state, risks, or next steps.
- If Linear update is requested or appropriate, summarize the repository update in a Linear comment. Do not put secrets in Linear.

## Status Values

Use these values consistently:

- `pass`: verified successfully with evidence.
- `fail`: verified and failed with a concrete symptom.
- `blocked`: cannot be verified until an owner action, permission, provider setup, or missing fact is resolved.
- `not_run`: intentionally not run yet.
- `unknown`: existing state is not known and no verification was attempted.

## Data Model

All data is Markdown. No database schema changes.

Deployment status entries should include:

- Environment: `preview` or `production`.
- Deployment type: automatic main deploy, manual Preview, redeploy, rollback, or smoke test update.
- URL: deployment URL or placeholder.
- Commit: short SHA or `unknown`.
- Branch: branch name when known.
- Actor: person or AI who triggered or recorded the event.
- Verifier: person who actually checked it.
- Provider status: Vercel, Supabase, PostHog.
- Smoke test table.
- Known issues.
- Rollback plan.
- Next actions.

Monitoring checklist entries should include:

- Signal name.
- Where to inspect.
- Expected result.
- Owner.
- Failure action.
- MVP1 required or future reserved.

Environment matrix entries should include:

- Environment name.
- Vercel target.
- URL role.
- App env value.
- Supabase role.
- PostHog separation method.
- Notes.

## External Providers

- Vercel: Production is triggered from `main`. PR branches do not automatically deploy Preview in the current setup. Repo Owner may manually create Preview deployments from a PR branch or commit SHA.
- Supabase: Current staging project is the only documented shared remote project. Production Supabase separation is reserved until a real production project exists.
- PostHog: MVP1-MVP3 use one project by default and separate data with shared event properties.
- Payment, AI, Email, Webhook providers: reserved for future MVPs and not MVP1 deploy blockers unless explicitly configured.

## Security

- Secrets: Never record secret values in repository docs, PRs, Linear comments, logs, or examples.
- Permissions: Repo Owner owns Production deploy verification and final Linear Done decision.
- User data: Do not include private customer data, full emails beyond agreed test identifiers, session cookies, OTPs, OAuth codes, or raw provider payloads.
- Abuse cases: Do not mark a smoke test passed because a page loaded. Verify each checklist item separately.

## Rollout

- Local: Add deploy memory docs and verify Markdown formatting.
- Preview: Not required for docs-only changes.
- Production: Rules become active after merge into `main`.

## Open Questions

- When a true Production Supabase project is created, update `context/environment-matrix.md` and the deployment status record.
- If shared Preview URLs become required for every PR, revisit Vercel account constraints and automation policy.
