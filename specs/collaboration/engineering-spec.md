# Engineering Spec: Collaboration Workflow And AI Guardrails

## Scope

建立项目级协作开发和 AI-assisted coding 执行规范。该规范约束本地分支、PR、review、Vercel 部署验证和 Linear 状态流转，不改变应用运行时代码。

## Affected Areas

- `AGENTS.md`
- `context/codex-rules.md`
- `context/status.md`
- `specs/collaboration/*`
- GitHub PR workflow
- Vercel deployment workflow
- Linear issue workflow

## Architecture

协作流程的控制点分为三层：

```text
Linear task
-> local Git branch
-> GitHub PR
-> GitHub web review
-> squash merge to main
-> Vercel Production deployment
-> Linear Done
```

AI Coding Agent 的执行入口是：

```text
read project rules
-> inspect git status and current branch
-> decide whether to continue, create branch, or warn
-> implement scoped change
-> verify
-> summarize branch and next PR action
```

## Branch Rules For AI Agents

- Before edits, run a local status check equivalent to `git status --short --branch` and identify the current branch.
- If the task requires code or documentation changes and the current branch is `main`, create a new task branch before editing.
- Branch names should reflect the task: `feat/xxx`, `fix/xxx`, `chore/xxx`, `docs/xxx`, or the agent default `codex/xxx`.
- If the current branch is not `main`, confirm it matches the current task before editing.
- If the current branch appears to belong to a different task, warn the user and recommend switching to `main`, pulling latest, and creating a fresh branch.
- If the current branch was previously merged or used for an older PR, do not reuse it for new work.
- If the working tree has uncommitted changes, do not switch branches, reset, checkout, or delete files unless the user explicitly approves.
- Never use destructive Git commands such as `git reset --hard` or `git checkout --` to force the workflow.
- After completing any workflow step, report both the result and the next best-practice action.

## AI Next-Step Guidance

AI Coding Agent responses should keep the developer oriented after each operation:

- After creating a branch, state the branch name and suggest implementing the scoped task there.
- After committing locally, suggest pushing the task branch when ready.
- After pushing a task branch, give the GitHub PR direction: `current-branch -> main`.
- After opening or preparing a PR, remind the developer to include local verification notes, screenshots, or recordings.
- After review requests changes, tell the developer to update the same branch and push again.
- After merge, remind the owner to verify Vercel Production.
- After Production verification, remind the developer to sync `main`, delete the local task branch, and move the Linear task to Done when appropriate.
- If a step cannot be completed, explain the blocker and the safest next action instead of only reporting failure.

## Developer Workflow

1. Claim a Linear task.
2. Pull latest `main`.
3. Create a task branch from `main`.
4. Develop locally on that branch.
5. Run local checks and preview.
6. Push the task branch to GitHub.
7. Open PR from the task branch to `main`.
8. Add validation notes, screenshots, or recordings to the PR.
9. If review requests changes, update the same branch and push again.
10. After merge and Production verification, mark the Linear task Done.
11. Delete the local task branch after syncing `main`.

## Repo Owner Workflow

1. Open the PR in GitHub web.
2. Review the code diff.
3. Review validation notes, screenshots, or recordings.
4. If changes are needed, comment and choose **Request changes**.
5. Re-review the same PR after the author pushes updates.
6. If acceptable, choose **Approve**.
7. Use **Squash and merge** into `main`.
8. Delete the remote PR branch, or rely on GitHub automatic head branch deletion.
9. Verify that Vercel starts a `main` Production deployment.
10. Open the Vercel Production URL and validate the affected user path.
11. If Vercel deployment fails or is blocked by Hobby collaboration checks, inspect the Vercel Dashboard and manually redeploy latest `main`.
12. Confirm the Linear task can move to Done after Production verification.

## Vercel Rules

- PR branches do not automatically deploy Preview.
- Only `main` automatically triggers Vercel deployment.
- PR verification relies on local checks, PR notes, screenshots or recordings, and owner review.
- If a shared Preview URL is required, the Repo owner may run or trigger a manual deployment and paste the URL into the PR.
- Vercel Preview or deployment checks should not be required GitHub merge gates while non-`main` automatic deployments are disabled.

## Data Model

No database schema changes.

## UI States

- Default: AI starts each task by checking Git status and branch.
- Empty: If no task is known, AI asks for or infers a safe branch name from the request.
- Loading: Not applicable.
- Error: Git or provider failures are reported with next safe action.
- Success: AI reports branch, changed files, verification, and PR/deployment next step.

## External Providers

- GitHub: Branches and PRs are the collaboration boundary. Current private-repo branch rules may not be enforceable on the free personal plan, so the workflow remains a project convention.
- Vercel: Only `main` auto deploys under the current `vercel.json` policy.
- Linear: Tasks move through claim, implementation, review, merge verification, and Done.

## Security

- Secrets: Never place tokens, private keys, customer data, or real credentials in branches, PR descriptions, Linear comments, logs, or docs.
- Permissions: Repo owner retains final merge and production verification responsibility.
- User data: PR screenshots or recordings must not expose private customer data.
- Abuse cases: Do not bypass review by pushing directly to `main`.

## Rollout

- Local: Update repository docs and verify Markdown content.
- Preview: Not required for docs-only workflow changes.
- Production: The rule becomes active for future AI-assisted work once merged to `main`.

## Open Questions

- Whether to later add an enforceable GitHub Team/Enterprise branch rule once the repository moves out of the free personal private-repo setup.
