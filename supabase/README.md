# Supabase Workspace

这个目录是本工程管理 Supabase schema 的入口。

## 规则

- 数据库 migration 放在 `supabase/migrations/`。
- 本地开发 seed data 放在 `supabase/seed.sql`。
- 不要提交真实凭证。
- 不要直接在共享 staging 或 production 的 Supabase Dashboard 里改 schema。
- 修改 schema、RLS、Auth、Storage、Realtime 或 Edge Functions 前，先读 `context/supabase-workflow.md`。

## 首次本地设置

本仓库已经包含本地 Supabase 配置、migration 和 seed 入口。开发者需要先安装 Supabase CLI 和 Docker runtime，然后在仓库根目录执行：

```bash
supabase start
supabase db reset
```

本机使用 Colima 作为 Docker runtime 时，`supabase/config.toml` 中的 local analytics 保持关闭，因为 Supabase vector 日志容器需要挂载 Docker socket，而 Colima 的 socket 路径在该容器挂载场景下不兼容。这个设置不影响 M2 DATA 的 database、Auth、REST、Studio、migration、seed 或 RLS 验证。

## M2 DATA 本地状态

M2 DATA 已经提供真实 migration 和 seed 入口。严格流程仍然要求每位开发者在自己的电脑上安装：

- Supabase CLI
- Docker runtime, such as Docker Desktop or Colima

然后执行：

```bash
supabase start
supabase db reset
```

当前仓库不包含真实远程 Supabase 配置，也不包含任何 secret。`supabase db reset` 已验证 `20260618021000_create_data_template.sql` 可以从空库恢复，并验证了 `user_profiles` / `demo_items` 的 owner-only 与 authenticated public-read RLS 边界。

## 连接共享远程项目

默认开发不需要连接远程 Supabase；先使用本地容器完成 migration 和 RLS 验证。需要为 Auth、OAuth 回调、邮件或团队联调连接线上项目时：

```bash
supabase login
supabase link --project-ref nglilxhkuqzswbwitbdu
```

规则：

- 优先 link 到 staging；production 只由 Maintainer 或 CI 迁移。
- 不要在个人分支对 production 执行 `supabase db push`。
- 不要把 remote Postgres password、Supabase access token、service role key 写进仓库。
- 真实 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY` 和 `SUPABASE_SERVICE_ROLE_KEY` 只放在本机 `.env.local` 或部署平台环境变量里。
- Auth 客户端只能使用 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`；`SUPABASE_SERVICE_ROLE_KEY` 只能出现在 server-only service 层。

当前 staging:

- Project ref: `nglilxhkuqzswbwitbdu`
- API URL: `https://nglilxhkuqzswbwitbdu.supabase.co`
- 已应用 migrations：`create_data_template`、`harden_data_template`、`revoke_public_rls_auto_enable`
- 安全 advisors 已清零；性能 advisors 只剩新表索引尚未被业务查询使用的 INFO 级提示。
