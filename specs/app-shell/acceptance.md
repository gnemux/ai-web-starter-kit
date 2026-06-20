# Acceptance: App Shell, Dashboard, And Edge States

## GNE-82 APP-02

- [x] 有可复用 app shell，包含品牌、导航、主内容区域、用户状态和页面容器。
- [x] 首页只保留注册和登录入口，不把受保护 Dashboard 作为 public 功能入口展示。
- [x] 首页主体是未来真实产品宣传页的示例式低保真首屏，不展示“当前已具备 / Available now”功能清单。
- [x] 首页 header 能根据 Supabase Auth 会话切换：未登录显示登录，已登录显示账户触发器和账户菜单。
- [x] 已登录账户菜单只包含当前真实存在的入口：工作台、账户设置、退出登录。
- [x] 桌面端和移动端导航都可用。
- [x] 登录后左侧导航和移动端横向导航使用同一套主导航，只包含工作台和账户。
- [x] 登录后顶部 header 不再显示“开始 / 数据 / 资料”这类重复 route nav。
- [x] 布局能承载后续 Dashboard、Specs、Integrations、Deploy、Growth 等页面。
- [x] 首页、登录、Dashboard、账户页面使用同一个 footer 内语言切换入口提供中文默认文案和英文切换能力。
- [x] 全局 footer 包含品牌说明、产品入口、产品/工程点位和版权声明。
- [x] Footer 中的链接只指向当前已存在的路由，不把未实现模块伪装成可点击功能。

## GNE-84 APP-04

- [x] `/dashboard` 页面存在。
- [x] Dashboard 主体只展示已有真实功能：demo_items 服务读取、空状态、错误状态和创建表单。
- [x] Dashboard 不显示会话、Profile、数据服务这类状态卡片，也不显示实现边界说明面板。
- [x] Dashboard 不再把 Linear/Milestone 样例内容作为产品功能展示。
- [x] Dashboard 使用真实 Supabase Auth 用户状态，不依赖 mock user。
- [x] 示例功能入口清晰，可作为后续模块扩展入口。
- [x] Account 页面只展示当前邮箱、display name 表单和保存反馈，不显示会话、资料、事件状态卡片。

## GNE-85 APP-05

- [x] `packages/ui` 提供空状态、加载状态、错误状态和长内容约束组件。
- [x] Dashboard 中能看到与当前真实功能相关的 empty / error / long content 处理。
- [x] 长文案不会溢出容器。
- [x] loading / empty / error 保持稳定布局，不导致明显跳动。

## Verification

- [x] `npx --yes pnpm@9.15.0 typecheck`
- [x] `npx --yes pnpm@9.15.0 build`
- [x] Browser check: `/`
- [x] Browser check: `/dashboard`
- [x] Mobile viewport check
- [x] `corepack pnpm typecheck`
- [x] `corepack pnpm lint`
- [x] `corepack pnpm build`
- [x] Browser check: `/` default Chinese and English switch
- [x] Browser check: `/login`
- [x] Browser check: `/dashboard` unauthenticated redirect
