# Codex Rules

## Start Here

For every task, Codex should first read:

1. `AGENTS.md`
2. `context/project.md`
3. `context/status.md`
4. `specs/collaboration/engineering-spec.md` when the task may involve code or documentation changes
5. the relevant feature spec under `specs/`
6. the relevant integration document under `integrations/`
7. `specs/deploy/engineering-spec.md` plus the relevant deploy memory document when the task involves deployment status, Preview / Production verification, smoke tests, production monitoring, incidents, or environment matrices

When a task changes code, tests, schema, migrations, configuration,
infrastructure, or technical documentation that affects implementation behavior,
also read `context/engineering-decision-rules.md`.

For CatCare UI or owner-flow work, also read
`specs/reference-product/catcare-ui-guidelines.md`; for CatCare icon or
illustration work, also read `apps/web/public/catcare/icons/icon-spec.md`.

For the Sol root-thread command `按项目规范执行当前 Linear 任务。`, use
`specs/collaboration/agent-orchestration.md` as the executable orchestration
contract. Do not infer task selection, delegation, or stop behavior from chat
history alone.

## SDD Rule

Do not implement a non-trivial feature directly from a vague request.

For each feature:

1. write or update `product-spec.md`
2. write or update `engineering-spec.md`
3. define acceptance checks
4. implement
5. verify
6. update status

Before implementation starts, restate the active issue or request scope, the
explicit non-goals, the smallest useful plan, and the acceptance evidence that
will prove the work. If the task is only an investigation or direct answer, say
that and do not invent implementation steps.

Completion must be evidence-based. Do not report "done" unless the response
names the changed surface, the verification actually run, and any missing
checks with reasons. UI-affecting work must include browser/screenshot or
equivalent visual evidence when the user needs to judge layout or fidelity.
Critical product tasks must self-review against prototype fidelity, route/user
flow, package/product boundaries, data/API behavior, and tests before asking for
review.

## Engineering Decision Rules

For implementation tradeoffs, use `context/engineering-decision-rules.md`.
It keeps the Minimal Responsible Implementation rule, untrusted-input boundary,
contract compatibility rule, and verification choice separate from workflow
rules in this file.

## Collaboration And Branch Safety

Before making code or documentation edits, Codex must inspect the current branch and working tree.

- If on `main` and the task requires edits, create a fresh task branch before editing.
- If on a non-`main` branch, verify that the branch matches the current task.
- If the branch is old, already merged, closed, or unrelated to the requested task, warn the user and recommend switching to latest `main` and opening a fresh branch.
- If uncommitted changes exist, do not switch branches, delete files, reset, or overwrite work without explicit user approval.
- Use one branch per task and one PR per focused change.
- PR branches do not rely on Vercel Preview in the current setup; only `main` automatically deploys to Vercel.
- Repo owner review, merge method selection, remote branch cleanup, and Production verification happen through GitHub and Vercel web UI unless the user explicitly requests CLI operations.
- While Vercel remains on Hobby with a private repository, non-owner collaborator PRs should use `Create a merge commit` so the latest `main` deployment commit is owner-authored. Avoid `Squash and merge` for collaborator PRs unless the resulting commit author is confirmed to pass Vercel checks.
- If a reviewed collaborator PR was already merged with a contributor-authored commit and Vercel blocks Production, the Repo Owner may create an owner-authored no-op trigger commit after confirming no unreviewed code is being introduced.
- After a PR is merged and production is verified, the associated Linear task can move to Done.
- After each key workflow step, Codex should state the result and the next best-practice action. Examples: after pushing a branch, suggest opening a PR to `main`; after merge, suggest checking Vercel Production; after Production verification, suggest syncing `main`, deleting the local branch, and moving Linear to Done.
- If the user asks Codex to complete the publish flow, Codex may create the PR after push and should fill the PR title and description using the repository template. The PR body must include what changed, the Linear issue when known, validation actually run, checks not run with reasons, reviewer notes, and a no-secrets confirmation.
- Supabase-specific checklist items should appear in the PR body only when the PR touches Supabase schema, RLS, Auth, Storage, Realtime, or database-backed behavior.

## Code Boundaries

- `apps/web`: application routes, pages, app-specific state, provider wiring.
- `packages/ui`: shared visual components.
- `packages/core`: shared business types, validation, provider interfaces, pure logic.
- `integrations`: provider setup, environment variables, webhook rules, operational notes.
- `specs`: product and engineering intent.

## Return Context Contract

Any interrupting flow must preserve the user context that launched it. This includes
login redirects, checkout, authorization, confirmation screens, and provider-hosted
or sandbox review pages.

- Do not hardcode a broad fallback such as `/account` when the user entered from a
  narrower state.
- Plain entry points should return to their plain source page.
- Blocked quota or paywall entry points should return to the same blocked context
  when the user cancels or fails the interrupting flow.
- Success may navigate to a result or refreshed entitlement state, but success URLs
  must not be treated as trusted entitlement proof.
- Cancel and failure must not grant entitlement, must not clear the user's relevant
  pre-flow state, and must not invent a blocked state when the entry point was not
  blocked.
- Preserve only safe, app-local paths. Reject external URLs, protocol-relative URLs,
  or arbitrary provider-controlled redirect targets.

## Analytics Capture Contract

When adding or changing analytics instrumentation, read `integrations/analytics.md`
first and treat it as the event contract.

- Use the local analytics wrappers, such as `trackEvent` and `trackServerEvent`.
  Do not scatter provider SDK calls through pages, components, or services.
- Every product event must include the shared MVP factory properties:
  `app`, `mvp_stage`, `market`, `env`, `version`, and `module`.
- Server-side events should include safe request context when available, such as
  `$lib=server`, `current_url` / `$current_url`, and `host`.
- Emit conversion and entitlement events from the trusted service boundary that
  owns the fact. For example, emit payment success after server-side Billing facts
  are written, not from a success URL or button click.
- Emit `quota_limit_reached` only from a server-side entitlement or quota decision
  that blocks a real gated action. Do not emit it from a generic pricing button,
  static disabled state, or page render alone.
- Analytics is observational. It must never become the source of truth for Auth,
  Payment, Billing, Entitlement, AI usage, Credit, quota, or provider status.
- Do not send raw prompts, generated text, passwords, OTPs, cookies, tokens,
  payment card data, service-role keys, provider secrets, raw webhook payloads,
  identity documents, or private customer data.
- Use safe categories and identifiers instead of raw error/provider payloads.
- Verification must expand at least one fresh event in PostHog Activity and check
  the shared properties plus the event-specific properties. If required fields are
  missing, fix instrumentation or environment variables before marking the task
  complete.

## UI Validation And Recovery Contract

Form and workflow UI should be understandable from the page, not only from code.

- If a field can fail validation and then be corrected in place, keep it controlled
  or otherwise synchronize UI state so the error clears as soon as the current
  input satisfies the visible rule.
- Server Action submissions must preserve the user's relevant selections and
  entered values after success, failure, or validation errors. Do not reset a model,
  plan, provider, language, or mode selector unless the reset is the explicit user
  action.
- Field-level errors should sit near the field, use stable spacing, and avoid
  layout jumps. Page-level failures should use the shared error state pattern.
- Recovery actions should be the next natural product action, not a hidden manual
  test page. Reviewer-only pages may exist, but the primary path should start from
  the user-facing product surface.
- Compact labels, badges, and buttons must remain readable in Chinese and English;
  shorten labels before allowing awkward wrapping or clipped text.
- A UI state may summarize service facts, but it must not invent business truth
  from URL params, client-only state, or analytics events.

## Billing Ledger Review Contract

Billing ledger rows are audit facts. Empty columns can be valid when the schema and
event semantics allow them.

- `billing_credit_ledger.entitlement_id` is nullable by design. It may be `NULL`
  for aggregate Credit consumption, plan-derived usage, historical rows whose
  entitlement was deleted, or MVP2 flows that do not allocate consumption against a
  specific entitlement row.
- Credit-pack or manual grant rows should normally point to the entitlement they
  created or changed. A grant row with `source_type=credit_pack` and
  `entitlement_id=NULL` needs investigation unless it is a known historical or
  duplicate-recovery row.
- Consumption rows must still carry trusted audit fields: `owner_id`, `event_type`,
  signed `amount`, `unit`, unique `idempotency_key`, `source_type`, and safe
  metadata.
- `billing_usage_ledger.related_credit_ledger_id` should be present for committed
  AI usage that writes a matching credit ledger entry. It may be `NULL` for older
  demo-only rows, reserved/released/failed rows, or non-credit usage that does not
  create a credit ledger event.
- Screenshots of Supabase tables are reviewer evidence only. The app must read and
  write Billing through service boundaries and migrations, not through manual
  dashboard edits.

## Verification

At minimum:

- run type checks for TypeScript changes
- run lint for code changes
- run build before release or deploy
- verify the user path affected by the change
- test empty, loading, error, and long-content states when UI is involved

## Deployment Memory And Recall

When the user mentions Production deployment, Preview deployment, Vercel redeploy, rollback, smoke test, production monitoring, environment variable separation, multi-environment setup, multi-product setup, or Linear issues `GNE-110`, `GNE-187`, `GNE-129`, or `GNE-74`, Codex must use the deploy memory workflow.

Read:

1. `specs/deploy/engineering-spec.md`
2. `context/deployment-status.md` for deployment, redeploy, rollback, or smoke test work
3. `context/production-monitoring.md` for monitoring, incident, or health-check work
4. `context/environment-matrix.md` for environment, product, market, or provider separation work

Before writing, summarize the currently remembered state. When updating, use `pass`, `fail`, `blocked`, `not_run`, or `unknown`; do not invent successful verification. Record environment variable key names and configured/missing/unknown status only, never values.

## Security

- Never store secrets in docs, examples, tests, commits, logs, or prompts.
- Keep `.env.example` as placeholders only.
- Keep related environment variables together in their provider/module block. Do not
  append new keys to the bottom of `.env.local` or `.env.example` when they belong
  with existing Payment, Supabase, Analytics, AI, Email, Storage, or SMS entries.
- Prefer least privilege for provider keys and automation tokens.
