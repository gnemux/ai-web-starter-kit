# Acceptance: App Shell, Dashboard, And Edge States

## GNE-82 APP-02

- [x] 有可复用 app shell，包含品牌、导航、主内容区域、用户状态和页面容器。
- [x] 首页只保留注册和登录入口，不把受保护 Dashboard 作为 public 功能入口展示。
- [x] 桌面端和移动端导航都可用。
- [x] 布局能承载后续 Dashboard、Specs、Integrations、Deploy、Growth 等页面。
- [x] 首页、登录、Dashboard、账户页面使用同一个全局语言切换入口提供中文默认文案和英文切换能力。

## GNE-84 APP-04

- [x] `/dashboard` 页面存在。
- [x] Dashboard 只展示已有真实功能：当前账户、profile 状态、demo_items 服务读写和安全边界提示。
- [x] Dashboard 不再把 Linear/Milestone 样例内容作为产品功能展示。
- [x] Dashboard 使用真实 Supabase Auth 用户状态，不依赖 mock user。
- [x] 示例功能入口清晰，可作为后续模块扩展入口。

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
