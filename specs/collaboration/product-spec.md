# Product Spec: Collaboration Workflow And AI-Assisted Development Guardrails

## Summary

为当前个人 GitHub Private Repo、Collaborator 协作、Vercel Hobby 部署环境建立稳定的协作开发准则，确保开发者和 AI Coding Agent 都按分支、PR、review、merge、部署验证的流程工作，减少误在 `main` 开发、复用旧分支、遗漏 review 或错误触发 Vercel Preview 的风险。

## User

- Primary user: Repo 拥有者、Collaborator 开发者、AI Coding Agent。
- Secondary user: 后续加入模板工程的开发者和维护者。

## Problem

当前 GitHub 免费个人私有仓库的 branch protection 可能无法强制执行，Vercel Hobby 在私有仓库多人协作下也不适合作为 PR Preview 的硬性门禁。团队必须通过仓库文档和 AI 执行规则保证流程一致：每个任务从最新 `main` 新开分支，PR 合并进入 `main`，由 Repo 拥有者在网页 review、选择适合当前 Vercel 限制的 merge method，并验证 Vercel Production。

## Goals

- 明确开发者、Repo 拥有者和 AI Coding Agent 的协作责任。
- 让 AI 在开始开发前检查当前分支、工作区状态和任务范围。
- 让 AI 默认遵循 Minimal Implementation First，优先做最小可验收闭环，减少过度设计、过度抽象和一次性组件库。
- 防止 AI 或开发者在旧功能分支上继续开发新任务。
- 防止直接在 `main` 上实现新功能或修复，除非用户明确要求且风险已说明。
- 固化当前 Vercel 规则：非 `main` 分支不自动部署，`main` 合并后触发 Production。
- 固化当前 Vercel Hobby / private repo 经验：外部 Collaborator PR 默认用 `Create a merge commit`，让 `main` 最新部署提交由 Repo Owner 生成。

## Non-goals

- 不引入 GitHub Actions 作为当前流程的必需步骤。
- 不要求升级 GitHub Team、Enterprise 或 Vercel Pro。
- 不把 Vercel Preview 作为 PR 阶段必需验证。
- 不定义大型发布管理、版本发布或多环境审批流程。

## User Journey

```text
kick off Linear task
-> sync latest main
-> create task branch
-> develop locally
-> push branch
-> open PR to main
-> owner reviews in GitHub
-> author updates same branch if needed
-> owner uses Create a merge commit for collaborator-authored PRs
-> main deploys on Vercel
-> owner verifies production
-> close Linear task
```

## Requirements

- GitHub tag `v0.2.0` is the MVP2 sealed baseline. MVP3 work should start from latest `main` at or after this tag.
- 开发者从 Linear 领取任务后，从最新 `main` 新开任务分支，例如 `feat/xxx`、`fix/xxx`、`chore/xxx` 或 `docs/xxx`。
- 一个任务使用一个分支；不要复用已经 merge、关闭或属于其他任务的旧分支。
- PR #34 and earlier task branches must not be reused for MVP3 work after `v0.2.0`; pull latest `main` and create a fresh branch for each MVP3 issue.
- 开发者在本地完成开发、检查和预览后 push 任务分支，并创建 PR 到 `main`。
- PR 阶段不依赖 Vercel Preview。开发者必须在 PR 描述中写清楚本地验证方式，并尽量提供截图或录屏。
- 如果 Repo 拥有者要求修改，开发者必须在同一个分支继续 commit 和 push，让原 PR 自动更新。
- Repo 拥有者只在 GitHub 网页进行 review、Request changes、Approve 和 merge。
- 在当前 Vercel Hobby / private repo 设置下，非 Repo Owner 的 Collaborator PR 默认使用 `Create a merge commit`，确保 `main` 上触发 Production 的最新 commit 是 Repo Owner 生成的 merge commit。
- 不要把 `Squash and merge` 作为非 Repo Owner PR 的默认发布方式；GitHub 生成的 squash commit 可能仍以 PR 作者为 author，导致 Vercel Hobby commit-author 校验 block Production build。
- `Squash and merge` 只适合不会触发 Hobby commit-author block 的场景，例如 Repo Owner 自己 authored 的 PR，或以后升级到支持 team collaboration 的 Vercel 方案后重新确认。
- PR merge 后删除远程分支；开发者同步 `main` 后删除本地任务分支。
- Linear 状态建议：开发完成并创建 PR 后进入 `In Review`；PR merge 并完成 Production 验证后进入 `Done`。
- AI Coding Agent 开始任何代码或文档修改前必须检查当前分支和工作区状态。
- AI Coding Agent should treat `v0.2.0` as the last stable release marker. If local `main` is behind `origin/main` or does not contain `v0.2.0`, fetch/pull before implementation.
- AI Coding Agent 实现 MVP 功能时必须优先选择最小可工作的改动；不得无必要引入新依赖、新抽象或大型组件库；但安全、支付、Auth、数据库代码不能以“最小”为理由省略校验、幂等、日志、权限、RLS、Webhook 校验或环境隔离。
- 最小可工作改动不能牺牲已经确认的产品交互、局部更新、数据一致性、可访问性基础或高保真 UI 要求；如果最小改法会让同页操作退化为整页刷新、丢失用户输入或破坏产品规范，它不算可验收实现。
- AI Coding Agent 如果发现当前在 `main` 且需要实现新任务，应先从 `main` 新开本地分支。
- AI Coding Agent 如果发现当前在旧任务分支、已 merge 分支或与新任务不匹配的分支，应提示用户并建议先切回 `main` 再新开分支。
- AI Coding Agent 如果工作区已有未提交变更，不得擅自切分支、覆盖或丢弃，应先说明状态并保护已有变更。
- AI Coding Agent 完成关键步骤后，必须同时说明处理结果和下一步符合最佳实践的建议。例如 push 分支后提示创建 PR，PR merge 后提示验证 Vercel Production 和清理本地分支。
- 当用户要求 AI 完成提交和推送时，AI 可以同时创建 PR，并根据仓库 PR 模板填写标题、变更摘要、Linear issue、验证记录、未运行检查和剩余风险。
- PR 模板应保持通用。Supabase 专项检查应放在 Supabase 相关 spec 或工作流文档中，只有触及 Supabase schema、RLS、Auth、Storage、Realtime 或数据库功能时才需要在 PR 描述中补充。

## Edge States

- Empty: 没有明确任务或 Linear issue 时，AI 应要求用户确认任务范围或使用简短描述命名分支。
- Loading: 不适用。
- Error: 分支创建、pull、push 或 merge 失败时，AI 应停止并说明失败原因，不得用破坏性命令绕过。
- Permission denied: GitHub 或 Vercel 权限不足时，由 Repo 拥有者在网页或 Dashboard 处理。
- Long content: PR 描述和 Linear 记录应保持结构化，避免把多个任务混在一个 PR。

## Success Metrics

- Activation: 新开发者能按文档完成一次分支开发和 PR。
- Retention: AI 在连续多个任务中不会复用错误分支或直接修改 `main`。
- Conversion: Repo 拥有者能稳定通过网页完成 review、merge、Production 验证。
- Quality: PR diff 聚焦单一任务，Vercel 只在 `main` 自动部署。
