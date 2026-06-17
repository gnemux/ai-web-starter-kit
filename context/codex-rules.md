# Codex Rules

## Start Here

For every task, Codex should first read:

1. `AGENTS.md`
2. `context/status.md`
3. the relevant spec under `specs/`
4. the relevant integration document under `integrations/`

## SDD Rule

Do not implement a non-trivial feature directly from a vague request.

For each feature:

1. write or update `product-spec.md`
2. write or update `engineering-spec.md`
3. define acceptance checks
4. implement
5. verify
6. update status

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

## Security

- Never store secrets in docs, examples, tests, commits, logs, or prompts.
- Keep `.env.example` as placeholders only.
- Prefer least privilege for provider keys and automation tokens.
