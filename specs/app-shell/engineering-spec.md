# Engineering Spec: App Shell, Dashboard, And Edge States

## Scope

实现 `GNE-82`、`GNE-84`、`GNE-85` 的第一版产品外壳、Dashboard 框架、UI edge states 和轻量 i18n 约束。

## Affected Areas

- `apps/web/app/layout.tsx`
- `apps/web/app/page.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/login/page.tsx`
- `apps/web/app/account/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/lib/i18n.ts`
- `apps/web/components/language-switcher.tsx`
- `packages/ui/src/index.tsx`
- `packages/core/src/index.ts`
- `specs/app-shell/*`
- `context/status.md`

## Architecture

```text
Next.js route
-> server locale reader
-> route dictionary selection
-> page composition
-> packages/ui reusable components
-> packages/core typed service contracts
```

页面组合逻辑放在 `apps/web`。可复用 UI primitive 放在 `packages/ui`。真实业务契约和 provider-independent 类型放在 `packages/core`，避免页面内堆叠硬编码结构。文案字典暂放在 `apps/web/lib/i18n.ts`，因为它服务于当前 Web 应用路由；若后续出现多个 app，再迁移到共享 package。

## I18n

- Supported locales: `zh`, `en`.
- Default locale: `zh`.
- Locale preference is stored in a non-sensitive cookie so Server Components can render the correct copy before hydration.
- The language switcher is rendered once from `RootLayout` in a global fixed utility position.
- Pages read translations from a typed dictionary. Components receive labels through props instead of importing page-specific copy.
- Language names are rendered as `中文` and `EN`; the global control must remain compact on mobile and avoid competing with route-level navigation.
- Form validation and provider service errors may stay in English until the service layer receives a dedicated error-code translation pass; page-level labels, actions, headings, empty states, and guidance copy must be localized now.
- Adding a visible UI string without a matching Chinese and English dictionary entry is not acceptable for route-level product UI.

## Data Model

当前不再为 Dashboard 维护纯展示型 capability/readiness/mock action 数据。工作台应消费真实服务契约：

- `AccountPayload`
- `DemoItem`
- `DemoItemsPayload`
- `ServiceResult<T>`

如果未来需要模块状态或运营看板，必须先定义真实数据来源、权限边界和规格，不应把静态样例数组放入 `packages/core`。

## UI States

- Default: Dashboard 展示当前账户、demo business data 和服务层状态。
- Empty: `EmptyState` 组件用于无数据或未配置状态。
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
