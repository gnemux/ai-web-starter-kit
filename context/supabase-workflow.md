# Supabase Collaboration Workflow

## 目标

多人协作时，Supabase 数据库结构必须像应用代码一样被版本管理、审查和验证。团队成员不应该在共享 Supabase 项目的 Dashboard 里随手建表、改字段或修改 RLS policy，因为这些变更不会自动进入 Git，其他开发者和 AI Agent 也无法稳定复现。

本规范适用于：

- 新建表、改字段、删字段
- 新建或调整 index、constraint、foreign key
- 编写 function、trigger、view
- 编写 RLS policy
- 调整 seed data
- 影响 Auth、Storage、Realtime、Edge Functions 的数据库变更

## 环境分层

```text
local developer database
-> shared staging Supabase
-> production Supabase
```

### Local

每位开发者默认在自己电脑上运行本地 Supabase。个人开发、试错、AI Coding、migration 验证都应该先在本地完成。

```bash
supabase start
supabase db reset
```

本地数据库结构必须来自仓库里的 migration，测试数据来自 `supabase/seed.sql`。

### Staging

团队维护一个共享的 staging Supabase 项目，用于多人联调和接近线上环境的验收。

- 当前 staging project ref: `<staging-project-ref>`
- 当前 staging API URL: `<staging-supabase-api-url>`
- 普通开发者不要直接在 staging Dashboard 建表或改表。
- 只有合并后的 migration 才能进入 staging。
- staging 可以由 CI 或 Supabase Maintainer 执行迁移。
- 本地 CLI 可以 link 到 staging 用于 `db diff`、类型生成或联调检查，但不能从个人分支直接 `db push` 未审查 migration。

当前仓库提供手动触发的 GitHub Actions staging migration workflow：`.github/workflows/supabase-staging-migrations.yml`。

- 只能在 migration 合并到 `main` 后运行。
- 触发时必须输入 `staging` 作为确认。
- GitHub Environment 使用 `staging`。
- 所需 GitHub Secrets 为 `SUPABASE_ACCESS_TOKEN`、`STAGING_PROJECT_ID`、`STAGING_DB_PASSWORD`。
- 可选 GitHub Variable 为 `SUPABASE_CLI_VERSION`，用于固定 Supabase CLI 版本。

### Production

生产 Supabase 项目必须严格受控。

- 只允许 Supabase Maintainer 或 CI 执行 migration。
- 不允许在生产 Dashboard 里手工改 schema。
- 生产变更前必须确认备份、回滚思路和影响范围。
- 普通开发者不要把本地 CLI link 到 production 后执行 schema 写入命令。

## 远程连接规则

本地 Supabase 默认只连接本机容器。需要连接共享线上项目时，必须显式记录目标环境，并且只把非敏感信息放进仓库。

允许提交到仓库：

- `supabase/config.toml` 中的本地开发配置。
- `.env.example` 中的空占位变量。
- 远程项目的环境用途说明，例如 staging / production 的责任边界。
- 非敏感的 Supabase project ref 占位名，例如 `SUPABASE_PROJECT_REF=`。

禁止提交到仓库：

- 真实 `SUPABASE_SERVICE_ROLE_KEY`。
- 真实远程数据库密码。
- 真实 Supabase access token。
- 任何客户数据、生产 seed、导出的远程用户数据。

本地 link 方式：

```bash
supabase login
supabase link --project-ref <staging-project-ref>
```

如果 CLI 要求输入 remote Postgres password，只能在本机交互输入或使用本机未提交的安全凭据管理方式。不要把密码写入命令历史、脚本、文档或 `.env.example`。

Auth 开发时只允许以下变量进入本机 `.env.local` 或部署平台环境变量：

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 可以被浏览器读取；`SUPABASE_SERVICE_ROLE_KEY` 只能用于 server-only service 代码，不能进入客户端 bundle、日志或 `NEXT_PUBLIC_` 变量。

## 标准开发流程

1. 在 Linear 认领一个明确的 Issue。
2. 创建功能分支。
3. 编写或更新 SDD 规格。
4. 新建 Supabase migration。
5. 在 migration 中完成 schema / RLS / index / seed 相关改动。
6. 本地运行 `supabase db reset`，确认空库可以完整恢复。
7. 更新相关 TypeScript 类型、业务逻辑和页面。
8. 运行项目检查。
9. 发起 PR，并填写 Supabase checklist。
10. Code Review 通过后合并，再由 CI 或 Maintainer 推进到 staging / production。

示例：

```bash
git checkout -b feature/GNE-89-user-profiles
supabase migration new create_user_profiles
supabase db reset
pnpm typecheck
pnpm build
```

## Migration 规则

- 每个数据库结构变更必须有 migration 文件。
- migration 文件名应描述业务目的，例如 `create_user_profiles`、`add_subscription_status`。
- 不要把多个无关业务变更塞进同一个 migration。
- 不要只在远程 Dashboard 改 schema。
- 不要手写无法追溯来源的 SQL 片段后忘记提交。
- destructive change 需要在 PR 里说明影响范围和回滚思路。

## RLS 和权限规则

Supabase 默认会把 `public` schema 暴露给 Data API。所有暴露给客户端访问的表都必须启用 RLS，并且 policy 要匹配真实业务访问模型。

最低要求：

- 新建业务表时默认执行 `alter table ... enable row level security;`
- 不要用用户可编辑的 metadata 做授权判断。
- 不要在浏览器或 `NEXT_PUBLIC_` 环境变量中暴露 `service_role` key。
- view、function、trigger 涉及权限时必须单独说明安全边界。
- UPDATE 场景需要同时考虑 SELECT policy，否则可能出现“更新 0 行但不报错”的情况。

示例：

```sql
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
```

## PR Checklist

涉及 Supabase 的 PR 必须回答：

- 是否包含 migration 文件？
- 是否可以从空数据库 `supabase db reset` 成功恢复？
- 是否启用了必要的 RLS policy？
- 是否需要 index、foreign key、unique constraint？
- 是否涉及 destructive change？
- 是否更新了 seed data？
- 是否更新了相关 TypeScript 类型？
- 是否没有提交真实 secret？
- 是否说明了 staging / production 的部署方式？

## AI Coding 提示词模板

```text
我正在处理 Linear Issue: <Issue ID 和标题>。

目标：
<说明这次数据库或 Supabase 能力要支持的业务结果>

请先读取：
- AGENTS.md
- context/status.md
- context/supabase-workflow.md
- integrations/supabase.md
- <相关 specs 文件>

范围：
- 允许修改：supabase/migrations、supabase/seed.sql、packages/core、apps/web 的相关模块。
- 不要修改：无关业务模块、真实远程 Supabase 配置、真实 secret。

实现要求：
- 所有 schema 变更必须通过 migration。
- 新建 exposed table 必须启用 RLS。
- service_role key 不得进入浏览器代码。
- 给出本地验证步骤。

验收方式：
- supabase db reset 成功。
- pnpm typecheck 通过。
- pnpm build 通过。
- PR 描述填写 Supabase checklist。

请先给出实现计划，等我确认后再开始改代码。
```

## 角色分工

- **普通开发者**：写 migration、本地验证、发 PR。
- **模块 Owner**：审查对应模块的数据模型和业务边界。
- **Supabase Maintainer**：审查高风险 schema、RLS、生产迁移和回滚方案。
- **CI / Release Owner**：把已合并 migration 推进到 staging / production。

## 什么时候可以单独建云端 Supabase 项目

默认不需要。每个开发者本地 Supabase 就是自己的开发数据库。

只有以下情况才建议单独建云端项目：

- 本机无法运行 Docker / Supabase CLI。
- 要测试真实 OAuth 回调、邮件、Webhook、Edge Functions 等云端能力。
- 正在开发长期、大型、风险较高的独立功能分支。
- 团队暂时没有 Supabase Branching，但需要隔离远程预览环境。
