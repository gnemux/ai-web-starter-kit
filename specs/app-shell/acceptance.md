# Acceptance: App Shell, Dashboard, And Edge States

## GNE-82 APP-02

- [x] 有可复用 app shell，包含品牌、导航、主内容区域、用户状态和页面容器。
- [x] 首页可以进入 Dashboard。
- [x] 桌面端和移动端导航都可用。
- [x] 布局能承载后续 Dashboard、Specs、Integrations、Deploy、Growth 等页面。

## GNE-84 APP-04

- [x] `/dashboard` 页面存在。
- [x] Dashboard 展示模板工程总览、capability tracks、next actions、integration readiness。
- [x] 用户状态为 mock/demo，不依赖真实 Auth。
- [x] 示例功能入口清晰，可作为后续模块扩展入口。

## GNE-85 APP-05

- [x] `packages/ui` 提供空状态、加载状态、错误状态和长内容约束组件。
- [x] Dashboard 中能看到这些 edge states 的真实渲染示例。
- [x] 长文案不会溢出容器。
- [x] loading / empty / error 保持稳定布局，不导致明显跳动。

## Verification

- [x] `npx --yes pnpm@9.15.0 typecheck`
- [x] `npx --yes pnpm@9.15.0 build`
- [x] Browser check: `/`
- [x] Browser check: `/dashboard`
- [x] Mobile viewport check
