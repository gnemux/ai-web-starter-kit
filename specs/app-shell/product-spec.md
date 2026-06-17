# Product Spec: App Shell, Dashboard, And Edge States

## Summary

为模板工程建立第一版可复用产品外壳和登录后 Dashboard 基础框架，让团队成员、未来用户和 AI Agent 都能清晰看到模板工程的能力轨道、下一步任务、集成准备度和基础 UI 状态。

## User

- Primary user: 参与模板工程建设的开发者、产品同伴和 AI Coding Agent。
- Secondary user: 未来用该模板快速启动 MVP 的独立开发者或小团队。

## Problem

当前工程只有一个首页基础模板，缺少可复用 app shell、Dashboard 空壳和边界状态组件。后续 Auth、Billing、Payment、Analytics、Deploy、Growth 都需要稳定的页面容器和统一的 UI 语言，否则功能会各自生长，难以协作和复用。

## Goals

- 建立克制、现代、工程化的 SaaS / Web App 外壳。
- 提供 Dashboard 基础框架，展示模板工程的模块状态和下一步行动。
- 沉淀 loading、empty、error、long content 等边界状态。
- 让未来功能页面可以复用同一套布局、按钮、状态和信息区组件。

## Non-goals

- 不接入真实登录系统。
- 不接入真实支付、数据库或 analytics provider。
- 不实现复杂权限模型。
- 不建立完整设计系统网站或组件文档站。

## User Journey

```text
open app
-> understand template positioning
-> enter dashboard
-> scan readiness and next actions
-> inspect integrations and edge states
-> choose the next Linear-backed implementation task
```

## Requirements

- 首页提供清晰入口，能进入 Dashboard。
- Dashboard 使用统一 app shell，包含导航、用户状态、主内容区和示例功能入口。
- Dashboard 展示 capability tracks、next actions、integration readiness 和 edge state preview。
- UI 风格应优雅、克制、易读、现代，不依赖大面积渐变或装饰元素。
- 移动端和桌面端都不能出现文字溢出、重叠或布局跳动。

## Edge States

- Empty: 无数据时提供明确状态、说明和下一步动作。
- Loading: 保持稳定尺寸，避免内容跳动。
- Error: 显示失败原因、恢复动作和不阻塞的说明。
- Permission denied: 当前阶段不实现真实权限，但组件应可承载该状态。
- Long content: 长标题、长描述和长列表必须自动换行并保持容器稳定。

## Success Metrics

- Activation: 新成员能从首页进入 Dashboard 并理解项目模块。
- Retention: 后续功能能复用 app shell 和状态组件。
- Conversion: 模板可支撑未来 SaaS / Web App MVP 的主工作台。
- Quality: `pnpm typecheck` 和 `pnpm build` 通过，桌面与移动端视觉检查通过。
