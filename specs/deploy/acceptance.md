# Acceptance: Deploy Operations Memory

## GNE-230 MVP3 Delivery Gate

GNE-230 validates the new delivery risk introduced by package consumption. It
does not rebuild the MVP1/MVP2 GitHub, Vercel, Supabase, or environment
processes.

### GNE-245 CI And Package Gate

- [x] MVP3 continues as a single monorepo for DELIVERY.
- [x] No long-lived `mvp3` branch, multi-repo split, or Cloudflare/Hono mainline
  implementation is introduced.
- [x] GitHub CI runs `pnpm lint`, `pnpm typecheck`, `pnpm test`, and
  `pnpm build`.
- [x] Root `pnpm test` includes AI safety, release-boundary, package-boundary,
  and package test tasks.
- [x] `pnpm test:package-boundaries` guards package public-entry imports,
  runtime/package boundaries, product-object leakage, client-side server-only
  access, and unsafe raw-token/raw-prompt telemetry fields.
- [x] PR #42 and the following `main` CI proved the package-consuming app still
  passes build after the `@xwlc/*` patch rehearsal.

### GNE-246 Environment Delta

- [x] Reference Product package-consumption entry does not require new
  environment variables.
- [x] Existing MVP2/MVP3 environment rules continue to apply: current cloud
  Supabase is reference/staging/test, Vercel Production and Preview entries stay
  separate, and true Production Supabase is not enabled during MVP3.
- [x] Payment stays sandbox/test-mode only and AI stays mock/no-op unless a later
  capability issue explicitly changes the reviewed provider mode.
- [x] No server-only secret, provider key, raw token, or private value is added
  to repo docs, Linear, client code, or `.env.example`.

### GNE-247 Migration Rule

- [x] No Reference Product DB migration exists yet in DELIVERY because the
  product data model starts under GNE-231.
- [x] Future Reference Product business tables, RLS policies, seed data, and
  schema changes must use `supabase/migrations/*` and reviewed repo evidence,
  not Supabase Dashboard-only edits.
- [x] Product business tables such as cat profiles, care plans, tasks, private
  links, and submissions stay product-side; they must not become generic
  `packages/db` platform objects.
- [x] Current DB status for GNE-245 through GNE-248 is `not_run / no migration
  needed`.

### GNE-248 Minimum Version Facts

Record these facts for each MVP3 deployed or reviewed Reference Product check:

| Fact | Minimum source |
| --- | --- |
| App code | GitHub PR and merge commit |
| Package state | `packages/*/package.json` plus package public exports used by `apps/web` |
| CI evidence | GitHub Actions run for PR and/or `main` |
| Deployment evidence | Vercel deployment record and URL when available |
| DB state | migration files included in the PR, or `not_run / no migration needed` |
| Smoke result | local or deployed smoke path with pass/fail/blocked/not_run |

- [x] The GNE-244 rehearsal provides a concrete version-fact example:
  PR #42, merge commit `2bd2572`, `@xwlc/*` package version `0.1.1`, no DB
  migration, passing CI/build, Vercel Production deployment `success`, and local
  `/reference-product` smoke `200 OK`.
- [x] No package registry, release train, complex version panel, or separate
  package publish flow is introduced.

### GNE-250 Deferred Smoke

- [ ] Deployed Reference Product smoke is intentionally deferred until PRODUCT,
  ACCESS, and CAPABILITY have the minimum business path, data/RLS, and provider
  evidence needed for a real deployed check.
- [x] Until then, GNE-250 status is `not_run / blocked by later MVP3 parents`,
  not a failed or passed smoke.

## Functional Checks

- [ ] A Repo Owner can use `context/deployment-status.md` to record a Production deployment.
- [ ] A Repo Owner can use `context/deployment-status.md` to record a manually created Preview deployment.
- [ ] A smoke test result can be recorded with `pass`, `fail`, `blocked`, or `not_run`.
- [ ] Known issues, rollback plan, and next actions have clear sections.
- [ ] `context/production-monitoring.md` lists MVP1 production checks and where to inspect each one.
- [ ] `context/environment-matrix.md` defines local, preview, and production naming rules.
- [ ] `context/environment-matrix.md` explains temporary shared provider values for Preview and Production without treating them as final isolation.

## Technical Checks

- [ ] `specs/deploy/product-spec.md` exists.
- [ ] `specs/deploy/engineering-spec.md` contains AI recall and writeback rules.
- [ ] `specs/deploy/test-plan.md` exists.
- [ ] `AGENTS.md` points AI agents to deploy memory rules for deployment operations tasks.
- [ ] `context/codex-rules.md` contains deploy memory trigger rules.
- [ ] `integrations/vercel.md` links the deploy memory documents.
- [ ] `context/status.md` records the documentation update.
- [ ] No secrets, real tokens, service-role keys, customer data, or private credentials are committed.

## Product Checks

- [ ] The docs clarify that `main` is Production and PR branches do not automatically deploy Preview in the current setup.
- [ ] The docs clarify that Repo Owner may manually create Preview deployments from PR branches or commit SHAs.
- [ ] The docs distinguish MVP1 required checks from future Payment, AI, Email, Webhook, China cloud, and China analytics reservations.
- [ ] Future AI agents can read the docs and summarize current deployment state before making updates.
