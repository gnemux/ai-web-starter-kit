## 变更摘要

- 

## Linear

- Issue：

## 验证

- [ ] `pnpm typecheck`
- [ ] `pnpm build`

## Supabase Checklist

当 PR 涉及 Supabase schema、RLS、Auth、Storage、Realtime、Edge Functions 或依赖数据库的功能时，必须填写这一部分。

- [ ] 本 PR 包含必要的 migration 文件。
- [ ] 可以从空本地数据库执行 `supabase db reset` 成功恢复。
- [ ] 新建的 exposed table 已启用 RLS。
- [ ] RLS policies 符合真实业务访问模型。
- [ ] 必要的 index、foreign key、unique constraint 已包含。
- [ ] 需要时已更新 seed data。
- [ ] 需要时已更新 TypeScript 类型或领域模型。
- [ ] 没有提交真实 secret、service role key 或私有凭证。
- [ ] destructive change 已说明影响范围和上线/回滚方式。
