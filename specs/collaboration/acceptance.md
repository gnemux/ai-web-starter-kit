# Acceptance: Collaboration Workflow And AI Guardrails

## Functional Checks

- [ ] A developer can follow the documented flow from Linear task to PR.
- [ ] A Repo owner can follow the documented flow from PR review to Vercel Production verification.
- [ ] AI rules require branch/status inspection before edits.
- [ ] AI rules require a new task branch when starting work from `main`.
- [ ] AI rules warn against reusing old or unrelated branches for new tasks.
- [ ] AI rules protect uncommitted work before switching branches or deleting files.
- [ ] AI responses include the completed step result and the next best-practice action.

## Technical Checks

- [ ] Collaboration spec files exist under `specs/collaboration`.
- [ ] `AGENTS.md` points agents to the collaboration workflow.
- [ ] `context/codex-rules.md` contains executable branch safety rules.
- [ ] `context/status.md` records the workflow documentation update.
- [ ] No secrets are committed.

## Product Checks

- [ ] The workflow matches the current GitHub private repo, Collaborator, and Vercel Hobby setup.
- [ ] The workflow does not require GitHub Actions.
- [ ] The workflow does not require automatic Vercel PR Preview deployments.
- [ ] The workflow keeps Repo owner review and merge in GitHub web.
- [ ] The workflow guides developers to the next correct action after push, PR update, merge, deployment, and branch cleanup.
