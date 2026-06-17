# Engineering Spec: App Shell, Dashboard, And Edge States

## Scope

实现 `GNE-82`、`GNE-84`、`GNE-85` 的第一版产品外壳、Dashboard 框架和 UI edge states。

## Affected Areas

- `apps/web/app/page.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/globals.css`
- `packages/ui/src/index.tsx`
- `packages/core/src/index.ts`
- `specs/app-shell/*`
- `context/status.md`

## Architecture

```text
Next.js route
-> page composition
-> packages/ui reusable components
-> packages/core typed demo data
```

页面组合逻辑放在 `apps/web`。可复用 UI primitive 放在 `packages/ui`。Dashboard 示例数据和模块状态类型放在 `packages/core`，避免页面内堆叠硬编码结构。

## Data Model

新增或扩展纯前端类型：

- `CapabilityStatus`
- `CapabilityTrack`
- `DashboardAction`
- `IntegrationStatus`
- `ReadinessMetric`

这些类型仅用于模板演示，不代表真实后端数据结构。

## UI States

- Default: Dashboard 展示 readiness metrics、模块列表、下一步行动和集成状态。
- Empty: `EmptyState` 组件用于无任务、无数据或未来模块未配置。
- Loading: `LoadingState` 组件使用稳定 skeleton rows。
- Error: `ErrorState` 组件显示恢复动作。
- Success: Status badges 和 readiness cards 显示完成/进行中/计划中状态。

## External Providers

无。当前不接入 Supabase、Payment、Analytics、Vercel API 或真实 Auth。

## Security

- Secrets: 不新增环境变量，不提交真实 secret。
- Permissions: Dashboard 使用 mock user 状态，不表达真实权限。
- User data: 不处理真实用户数据。
- Abuse cases: 无外部输入提交。

## Rollout

- Local: `pnpm typecheck`、`pnpm build`、本地浏览器检查。
- Preview: 后续接入 Vercel Preview 后自动验证页面。
- Production: 当前只是模板 UI，不涉及生产数据。

## Open Questions

- 后续是否引入正式图标库，例如 `lucide-react`。
- Dashboard 是否在接入 Auth 后默认放到受保护路由下。
