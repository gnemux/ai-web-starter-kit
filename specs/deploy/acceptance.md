# Acceptance: Deploy Operations Memory

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
