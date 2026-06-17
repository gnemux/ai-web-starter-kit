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

## AI Coding Flow

1. Restate the target issue and scope.
2. Identify affected modules and documents.
3. Read existing code and specs before editing.
4. Propose a short implementation plan for non-trivial work.
5. Make focused changes.
6. Run relevant checks.
7. Summarize what changed and what remains.

## Linear

The main tracking project is:

- `Web 端的可商用模板工程`
- Project short ID: `98f7dceca282`
- Project UUID: `55cd8118-82ed-4c12-a977-f5b117d3a5e7`

Use the issue tree in `context/linear.md` as the project baseline.
