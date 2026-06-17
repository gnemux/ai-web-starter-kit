# Supabase Workspace

这个目录是本工程管理 Supabase schema 的入口。

## 规则

- 数据库 migration 放在 `supabase/migrations/`。
- 本地开发 seed data 放在 `supabase/seed.sql`。
- 不要提交真实凭证。
- 不要直接在共享 staging 或 production 的 Supabase Dashboard 里改 schema。
- 修改 schema、RLS、Auth、Storage、Realtime 或 Edge Functions 前，先读 `context/supabase-workflow.md`。

## 首次本地设置

先在仓库外安装并登录 Supabase CLI。等团队开始第一个真实 Supabase 实现任务时，再初始化本地 Supabase 配置：

```bash
supabase init
supabase start
supabase db reset
```

`supabase/config.toml` 目前故意没有提交。等第一个真实 Supabase 实现 Issue 开始时，再用 CLI 生成。
