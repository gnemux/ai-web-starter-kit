# Product Spec: App Shell, Dashboard, And Edge States

## Summary

为模板工程建立第一版可复用产品外壳和登录后 Dashboard 基础框架，让开发者、未来用户和 AI Agent 都能清晰使用已经具备功能的界面，并在干净、克制的模板框架上继续扩展。

## User

- Primary user: 参与模板工程建设的开发者、产品同伴和 AI Coding Agent。
- Secondary user: 未来用该模板快速启动 MVP 的独立开发者或小团队。

## Problem

当前工程已经具备 Auth、账户资料和 demo data 服务示例，但页面仍混有用于展示视觉风格的样例内容。后续 Auth、Billing、Payment、Analytics、Deploy、Growth 都需要稳定的页面容器、统一的 UI 语言和多语言约束，否则功能会各自生长，难以协作和复用。

## Goals

- 建立克制、现代、工程化的 SaaS / Web App 外壳。
- 界面品牌名统一为 `XWLC`，副标题低调使用 `eXtensible Web Launch Core`。
- 浏览器标题、应用 metadata、favicon 和默认公开 app name 统一使用 `XWLC`，避免线上页面或埋点继续显示旧的 `ai-web-starter-kit` 名称。
- 提供 Dashboard 基础框架，只展示已经有真实功能或明确可操作的内容。
- 账户页只展示当前身份信息与可保存的 profile 表单，不展示无独立功能的状态卡片。
- 沉淀 loading、empty、error、long content 等边界状态。
- 让未来功能页面可以复用同一套布局、按钮、状态和信息区组件。
- 默认支持中文界面，并提供英文界面切换能力。

## Non-goals

- 不新增第二套登录系统或复杂权限模型。
- 不接入真实支付、数据库或 analytics provider。
- 不实现复杂权限模型。
- 不建立完整设计系统网站或组件文档站。
- 不把 Linear/Milestone、provider roadmap 或纯展示数据伪装成用户功能。

## User Journey

```text
open app
-> understand template positioning
-> choose sign up or login
-> enter protected workspace after authentication
-> create or inspect demo business data
-> update account profile
-> switch language when needed
```

## Requirements

- 首页提供清晰入口，只保留注册和登录入口；受保护工作区由登录成功后进入。
- 首页内容应呈现为一个克制的示例式产品首屏：使用通用但产品化的主张、产品画面和行动入口点位，启发模板使用者理解未来真实产品的生长方向，但不展示当前工程能力清单。
- 首页 header 需要感知当前登录态：未登录显示登录入口；已登录显示克制的账户触发器，点击后出现账户菜单，不再显示 Login 按钮。
- 已登录账户菜单只能包含当前真实存在的动作，例如工作台、个人资料、套餐、AI 和退出登录；不得加入 History、Bookmarks、Notifications 等尚未实现的入口。
- Dashboard 使用统一 app shell，包含导航、用户状态、主内容区和真实可操作功能入口。
- 登录后的 app shell 只保留一套主导航：左侧桌面导航和移动端横向导航显示同一组工作区路由；顶部不再复刻“开始 / 数据 / 资料”这类二级 route nav。
- 工作区主导航只展示当前真实存在的一级工作区路由：工作台、个人资料、套餐、AI。Public 首页可通过品牌和 footer 返回，但不作为工作区主导航项出现。
- Dashboard 主体聚焦 `demo_items` 服务读写示例；当前账户状态由 shell 和账户菜单承载，不在页面主体重复做状态卡片。
- Account 个人资料页主体只展示当前邮箱、display name 表单和保存反馈；套餐和 AI 作为同级工作区入口出现，不挂在“账户”二级菜单下。
- 尚未实现的模块、指标或状态不得以工作台/账户功能卡片出现；如需表达，只能写入规格或低干扰工程说明。
- 全局 footer 应作为页面结构的一部分出现，包含品牌说明、真实可达的产品入口、面向未来真实产品扩展的产品/工程点位和版权声明。
- UI 风格应优雅、克制、易读、现代，不依赖大面积渐变或装饰元素。
- 移动端和桌面端都不能出现文字溢出、重叠或布局跳动。
- 所有新增界面文案必须通过项目内 i18n 字典提供中文和英文版本，默认语言为中文。
- 语言切换应放在全局 footer 的合适位置，不应由每个页面单独重复渲染，并保持当前页面语境。
- 中文和英文文案都应简短、工程化、少装饰，避免为了展示视觉效果而新增无功能实体。
- 浏览器 favicon 应使用与 `XWLC` 品牌一致的简洁图形，支持在小尺寸标签页中清晰识别。

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
