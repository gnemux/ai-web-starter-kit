# Acceptance: Collaboration Workflow And AI Guardrails

## Functional Checks

- [ ] A developer can follow the documented flow from Linear task to PR.
- [ ] A Repo owner can follow the documented flow from PR review to Vercel Production verification.
- [ ] AI rules require branch/status inspection before edits.
- [ ] AI rules require a new task branch when starting work from `main`.
- [ ] AI rules warn against reusing old or unrelated branches for new tasks.
- [ ] AI rules protect uncommitted work before switching branches or deleting files.
- [ ] AI responses include the completed step result and the next best-practice action.
- [ ] AI can create a PR after push and fill the PR description from the repository template.
- [ ] The default PR template is generic and does not include a permanent Supabase-only checklist.
- [ ] Repo owner workflow documents `Create a merge commit` as the default for non-owner collaborator PRs under the current Vercel Hobby / private repo setup.
- [ ] Vercel blocked-deployment remediation explains when an owner-authored no-op trigger commit is acceptable after reviewed code is already merged.

## Technical Checks

- [ ] Collaboration spec files exist under `specs/collaboration`.
- [ ] `AGENTS.md` points agents to the collaboration workflow.
- [ ] `context/codex-rules.md` contains executable branch safety rules.
- [ ] `.github/pull_request_template.md` asks for general summary, Linear, verification, impact, and security notes.
- [ ] `context/status.md` records the workflow documentation update.
- [ ] No secrets are committed.

## Product Checks

- [ ] The workflow matches the current GitHub private repo, Collaborator, and Vercel Hobby setup.
- [ ] The workflow does not require GitHub Actions.
- [ ] The workflow does not require automatic Vercel PR Preview deployments.
- [ ] The workflow keeps Repo owner review and merge in GitHub web.
- [ ] The workflow avoids `Squash and merge` as the default for collaborator-authored PRs while Vercel Hobby commit-author checks apply.
- [ ] The workflow guides developers to the next correct action after push, PR update, merge, deployment, and branch cleanup.
