# Test Plan: Deploy Operations Memory

## GNE-230 MVP3 Delivery Checks

GNE-230 checks package-consumption delivery risk only. Do not repeat the whole
MVP1/MVP2 deployment setup.

### GNE-245

1. Confirm the repo remains a single monorepo with `apps/*` and `packages/*` in
   `pnpm-workspace.yaml`.
2. Confirm `.github/workflows/ci.yml` runs install, lint, typecheck, test, and
   build on PRs and `main` pushes.
3. Confirm root `pnpm test` includes `pnpm test:package-boundaries`.
4. Confirm `pnpm build` runs package builds before the app build through Turbo.
5. Confirm no multi-repo split, long-lived `mvp3` branch, or Cloudflare/Hono
   implementation is introduced.

### GNE-246

1. Confirm the Reference Product package-consumption entry uses existing env
   rules and introduces no new env variables.
2. Confirm current Supabase remains reference/staging/test for MVP3.
3. Confirm Payment remains sandbox/test-mode only and AI remains mock/no-op for
   DELIVERY.
4. Confirm no secret values are written to docs, Linear, client code, or
   `.env.example`.

### GNE-247

1. If a Reference Product schema change exists, confirm the PR contains a
   matching file under `supabase/migrations/*`.
2. If no schema change exists, record `not_run / no migration needed`.
3. Confirm no product business tables are added to `packages/db` as generic
   platform objects.
4. Confirm future RLS evidence owners are clear: PRODUCT owns data model,
   ACCESS owns owner/anonymous boundaries, VERIFY owns final negative checks.

### GNE-248

1. Record app commit or PR.
2. Record workspace package versions or package state.
3. Record CI/build evidence.
4. Record deployment URL/status when available.
5. Record migration range or `not_run / no migration needed`.
6. Record smoke result or the explicit reason smoke is not run.

### GNE-250

Do not run deployed Reference Product smoke until PRODUCT, ACCESS, and
CAPABILITY have created the minimum path. Before then, record GNE-250 as
`not_run / blocked by later MVP3 parents`.

## Unit Tests

- Not applicable. This is a documentation and process automation change.

## Integration Tests

- Not applicable. No runtime integration behavior changes.

## Browser / E2E Checks

- Not applicable. No UI behavior changes.

## Manual Verification

- Check `context/deployment-status.md` has a latest status section, Preview and Production templates, smoke test table, known issues, rollback plan, and next actions.
- Check `context/production-monitoring.md` has MVP1 monitoring checks with owner, inspection location, expected result, and failure action.
- Check `context/environment-matrix.md` has local / preview / production rules and multi-product naming rules.
- Check `specs/deploy/engineering-spec.md` tells AI when to recall and update deploy memory.
- Check `AGENTS.md` and `context/codex-rules.md` point future AI agents to deploy memory docs.
- Check `integrations/vercel.md` links the deploy memory docs.
- Run `git diff --check`.

## Regression Risks

- Future agents may still rely on chat history instead of repository memory if trigger rules are too vague.
- Operators may record successful Vercel deploys as full smoke test success; checklist wording must keep provider checks separate.
- Environment variable records could leak secrets if docs do not repeatedly say to record key status only, not values.
