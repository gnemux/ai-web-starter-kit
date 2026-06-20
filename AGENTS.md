# Project Agent Guidance

## Required Reading

Before making code or documentation changes, read:

1. `context/project.md`
2. `context/status.md`
3. `context/codex-rules.md`
4. The relevant file under `specs/`
5. The relevant file under `integrations/` when touching a third-party service
6. `context/supabase-workflow.md` when touching Supabase schema, RLS, Auth, Storage, Realtime, or database-backed features

## Working Rules

- Use Specification Driven Development: product spec first, engineering spec second, implementation third, verification last.
- Keep changes scoped to the Linear issue or user request.
- Prefer durable patterns over one-off patches.
- Do not commit secrets, API keys, customer data, private credentials, or real tokens.
- Do not invent provider behavior. Read the integration document before coding against Supabase, Vercel, analytics, payment, email, or AI APIs.
- Do not change Supabase schema through remote dashboards without a migration file in the repository.
- Update `context/status.md` when a change materially affects project progress, deployment state, risks, or next steps.
- Add or update tests when changing behavior.
- Keep reusable business logic in `packages/core`, reusable UI in `packages/ui`, and product-specific routes in `apps/web`.
- Follow `specs/collaboration/*` for branch, PR, review, Vercel, and Linear workflow rules.

## Branch And PR Safety

- Before making code or documentation changes, inspect the current Git branch and working tree.
- Do not start new work directly on `main`. If the working tree is clean and the task needs edits, create a task branch from latest `main`.
- Use one branch per task. Do not reuse old, merged, closed, or unrelated task branches.
- If the current branch does not match the requested task, stop and explain the mismatch before editing.
- If the working tree has uncommitted changes, protect them. Do not switch branches, reset, delete, or overwrite files without explicit user approval.
- Push task branches and use PRs into `main`; Repo owner performs final review, squash merge, and Vercel Production verification.
- After completing a workflow step, report the result and the next best-practice action so the developer knows what to do next.

## AI Coding Flow

1. Restate the target issue and scope.
2. Identify affected modules and documents.
3. Inspect current branch and working tree; create or recommend a suitable task branch when needed.
4. Read existing code and specs before editing.
5. Propose a short implementation plan for non-trivial work.
6. Make focused changes.
7. Run relevant checks.
8. Summarize what changed, the current branch, verification, what remains, and the next best-practice step.

## Linear

The main tracking project is:

- `Web 端的可商用模板工程`
- Project short ID: `98f7dceca282`
- Project UUID: `55cd8118-82ed-4c12-a977-f5b117d3a5e7`

Use the issue tree in `context/linear.md` as the project baseline.
