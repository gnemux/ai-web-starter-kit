# Engineering Spec: App Shell, Dashboard, And Edge States

## Scope

实现 `GNE-82`、`GNE-84`、`GNE-85` 的第一版产品外壳、Dashboard 框架、UI edge states 和轻量 i18n 约束。

## Affected Areas

- `apps/web/app/layout.tsx`
- `apps/web/app/icon.svg`
- `apps/web/app/page.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/login/page.tsx`
- `apps/web/app/account/account-shell.tsx`
- `apps/web/app/account/page.tsx`
- `apps/web/app/account/billing/page.tsx`
- `apps/web/app/account/usage/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/components/account-menu.tsx`
- `apps/web/components/site-footer.tsx`
- `apps/web/lib/i18n.ts`
- `apps/web/lib/services/auth.ts`
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

Root metadata must present the public app as `XWLC`. `apps/web/app/icon.svg` provides the App Router favicon and should be a compact XWLC lettermark that works at browser tab size. Runtime analytics defaults should also use `XWLC` unless an environment-specific `NEXT_PUBLIC_APP_NAME` override is intentionally configured.

公开首页可以通过 `getCurrentAccountForPublicShell()` 读取当前 Supabase Auth 会话，但不得在未登录时重定向，也不得因为远程 Auth 校验慢或不可用而阻塞 `/` 或 `/login`。读取失败、超时或未登录时回退到普通登录入口；读取成功时 header 显示账户触发器。账户菜单由客户端组件负责展开/收起和退出提交，退出仍复用 `signOutAction`，不绕过服务层。

首页主体使用 i18n 字典中的示例式产品文案和低保真界面点位渲染。它可以展示未来产品宣传页的结构感，但不得列出当前实现能力、路线图模块或伪装成真实业务内容的功能清单。

登录后 app shell 的导航分工：

- `navItems` 是唯一的 route-level 主导航来源，桌面左侧导航和移动端横向导航使用同一组 items。
- 顶部 header 只承载品牌在移动端的显示和账户菜单等用户级动作，不再根据 `navItems` 生成 secondary nav。
- 当前已实现的工作区主导航是一级菜单：`/dashboard`、`/account`、`/account/billing`、`/account/usage`。Public `/` 由品牌链接和 footer product link 承载，不进入工作区主导航。

## I18n

- Supported locales: `zh`, `en`.
- Default locale: `zh`.
- Locale preference is stored in a non-sensitive cookie so Server Components can render the correct copy before hydration.
- `RootLayout` renders one global footer after route content. The footer owns the only global language switcher.
- Pages read translations from a typed dictionary. Components receive labels through props instead of importing page-specific copy.
- Language names are rendered as `中文` and `EN`; the footer control must remain compact on mobile and avoid competing with route-level navigation.
- Form validation and provider service errors may stay in English until the service layer receives a dedicated error-code translation pass; page-level labels, actions, headings, empty states, and guidance copy must be localized now.
- Adding a visible UI string without a matching Chinese and English dictionary entry is not acceptable for route-level product UI.

## Footer

- Footer composition belongs in `apps/web/components/site-footer.tsx` because it is product shell structure, not a shared UI primitive.
- Footer links may point only to implemented routes: `/`, `/login`, `/login?mode=signup`, `/dashboard`, `/account`, `/account/billing`, and `/account/usage`.
- Footer may include product and engineering slot columns for teams to adapt when the starter is applied to a real product; these entries stay as text and must not present unimplemented modules as working navigation.
- Copyright text should use the current calendar year from the server render and remain localized.

## Data Model

当前不再为 Dashboard 维护纯展示型 capability/readiness/mock action 数据。工作台应消费真实服务契约：

- `AccountPayload`
- `DemoItem`
- `DemoItemsPayload`
- `ServiceResult<T>`

如果未来需要模块状态或运营看板，必须先定义真实数据来源、权限边界和规格，不应把静态样例数组放入 `packages/core`。

## UI States

- Default: Landing header 根据登录态显示 Login 或账户菜单；Dashboard 展示 demo business data 列表和创建表单；Account 资料页展示当前邮箱和 profile 保存表单，Plans 页展示套餐选择和套餐记录，AI 页展示可用 Credit、额度包充值和 Credit 消耗记录；登录后 shell 用一级菜单展示工作台、个人资料、套餐和 AI。
- Empty: `EmptyState` 组件用于无数据或未配置状态。
- Loading: `LoadingState` 组件使用稳定 skeleton rows。
- Error: `ErrorState` 组件显示恢复动作。
- Success: 仅在有真实服务结果支撑时显示轻量状态提示；不得使用 readiness cards 代表尚未形成独立功能的模块、事件或指标。

## Compact Label Rules

- 短标签、状态徽标、一级菜单标签和紧凑按钮文案必须在中文和英文下都保持稳定、克制、可扫描。
- Badge / status pill 这类短标签必须保持单行显示，不得出现中文单字拆行，例如把 `基础` 拆成上下两行。
- 如果紧凑标签在移动端或窄容器内放不下，应缩短标签，并把解释性内容放到正文、说明或记录项中，而不是依赖任意换行。

## Form Validation And Recovery Rules

- 可被用户立刻修正的字段校验必须跟随当前输入状态更新。比如输入长度从 2 个字符变成 3 个字符后，错误提示和不可提交状态应自动恢复，不需要刷新页面或重新进入流程。
- Server Action 提交成功、失败或返回校验错误后，应保留用户当前选择和输入内容，例如模型、套餐、provider、语言和模式。除非用户明确切换，不应自动回到默认选项。
- 字段级错误应出现在字段附近，并预留稳定空间，避免错误出现/消失导致页面明显跳动。
- 页面级错误继续使用共享 `ErrorState`，并提供自然恢复动作，例如重试当前操作或返回上一层业务入口。
- 从业务限制触发的付费/升级入口，取消后应回到触发前的上下文；如果是从普通套餐页进入，则回普通套餐页，不应伪造业务 blocked 状态。
- UI 可以展示服务层返回的事实摘要，但不得根据 URL 参数、客户端状态或 Analytics 事件自行制造 Auth、Payment、Billing、Entitlement、AI、Credit 或 quota 的可信事实。

## External Providers

当前 app shell 通过已有 Auth 服务读取 Supabase 会话。除此之外不新增 Payment、Analytics、Vercel API 或其他 provider UI。

## Security

- Secrets: 不新增环境变量，不提交真实 secret。
- Permissions: 受保护页面和退出动作继续通过 Auth 服务边界处理。
- User data: 首页只显示当前账号的安全展示字段，例如 display name 或 email，不读取 token 或 provider payload。
- Abuse cases: 无外部输入提交。

## Rollout

- Local: `pnpm typecheck`、`pnpm build`、本地浏览器检查。
- Preview: 后续接入 Vercel Preview 后自动验证页面。
- Production: 当前只是模板 UI，不涉及生产数据。

## Open Questions

- 后续是否引入正式图标库，例如 `lucide-react`。
