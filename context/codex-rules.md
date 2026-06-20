# Codex Rules

## Start Here

For every task, Codex should first read:

1. `AGENTS.md`
2. `context/status.md`
3. `specs/collaboration/engineering-spec.md` when the task may involve code or documentation changes
4. the relevant feature spec under `specs/`
5. the relevant integration document under `integrations/`
6. `specs/deploy/engineering-spec.md` plus the relevant deploy memory document when the task involves deployment status, Preview / Production verification, smoke tests, production monitoring, incidents, or environment matrices

## SDD Rule

Do not implement a non-trivial feature directly from a vague request.

For each feature:

1. write or update `product-spec.md`
2. write or update `engineering-spec.md`
3. define acceptance checks
4. implement
5. verify
6. update status

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
- Prefer least privilege for provider keys and automation tokens.
