# AI Web Starter Kit

一个面向小团队快速试错的可商用 Web 产品模板工程。

本工程的目标不是只提供一套页面或组件，而是沉淀一条可复用的产品生产线：从 idea 收集筛选、规格编写、AI 辅助开发、MVP 上线、数据监控到推广营销，都能被团队成员和 AI Agent 清晰读取、分工、实现和迭代。

## 项目定位

- **产品形态**：可复用的 Web SaaS / Web App 商业模板。
- **协作方式**：Linear 管理任务，GitHub 管理代码，文档约束 AI Coding。
- **开发方式**：Specification Driven Development（SDD），先写清规格，再实现和验收。
- **当前阶段**：工程初始化，重点建立目录结构、AI 可读上下文、SDD 模板和 Linear 任务树。

## 技术栈

| 领域 | 默认选择 | 说明 |
| --- | --- | --- |
| Runtime | Node.js 22 | 统一本地开发和部署运行时 |
| 包管理 | pnpm 9.15 | 使用 workspace 管理 monorepo |
| 任务编排 | Turborepo | 统一运行 `dev`、`build`、`typecheck` 等任务 |
| Web 框架 | Next.js App Router | 作为主应用入口 |
| UI | React 19 + Tailwind CSS | 先保持轻量，后续按 shadcn/ui 约定扩展组件 |
| 语言 | TypeScript strict mode | 默认要求类型边界清晰 |
| Auth / Database | Supabase | 第一阶段默认登录和数据服务 |
| 部署 | Vercel | 第一阶段默认 Preview / Production 部署平台 |
| 数据监控 | PostHog 优先，预留国内友好方案 | 事件、漏斗、转化监控走 adapter |
| 支付 | Sandbox Provider 优先 | 先跑通结账闭环，再选择真实 Provider |

选型原则写在 `context/tech-stack.md`。当引入新依赖或更换服务时，先更新对应文档，再实现代码。

## 目录结构

```text
.
├── AGENTS.md                 # AI Agent 和 Codex 的项目级工作规则
├── README.md                 # 团队成员的项目入口
├── apps/
│   └── web/                  # Web 应用入口，默认使用 Next.js App Router
├── context/
│   ├── architecture.md       # 架构边界和模块关系
│   ├── codex-rules.md        # Codex 执行规则
│   ├── linear.md             # Linear 项目、Milestones 和任务树
│   ├── project.md            # 项目目标、范围和分工
│   ├── status.md             # 当前进度、阻塞和下一步
│   ├── supabase-workflow.md  # Supabase 多人数据库协作规范
│   └── tech-stack.md         # 技术栈和选型原则
├── integrations/
│   ├── _template.md          # 第三方集成文档模板
│   ├── analytics.md          # 埋点和监控集成说明
│   ├── payment.md            # 支付和权益集成说明
│   ├── supabase.md           # 数据库和 Auth 集成说明
│   └── vercel.md             # 部署集成说明
├── packages/
│   ├── core/                 # 跨端业务模型、类型和纯逻辑
│   └── ui/                   # 可复用 UI 组件
├── specs/
│   └── _template/            # SDD 规格模板
└── supabase/
    ├── migrations/           # 数据库 migration 文件
    └── seed.sql              # 本地开发 seed data
```

核心边界：

- `apps/web` 放产品页面、路由、应用壳和 Web 端组合逻辑。
- `packages/core` 放业务类型、领域模型、权益判断、事件定义等纯逻辑。
- `packages/ui` 放跨页面复用的 UI 组件，避免把业务流程写进通用组件。
- `context` 放项目长期上下文，帮助人和 AI 理解“为什么这样做”。
- `specs` 放每个功能的产品规格、工程规格、验收标准和测试计划。
- `integrations` 放外部服务接入边界，避免真实 Provider 逻辑散落在业务代码里。
- `supabase` 放数据库 migration、seed data 和 Supabase 本地开发入口。

## 本地运行

建议先确认 Node.js 和包管理器版本：

```bash
node --version
pnpm --version
```

安装依赖：

```bash
pnpm install
```

如果本机还没有 pnpm，可以临时使用固定版本：

```bash
npx --yes pnpm@9.15.0 install
```

启动开发环境：

```bash
pnpm dev
```

常用检查：

```bash
pnpm lint
pnpm typecheck
pnpm build
```

当前 Web 应用默认运行在 `http://127.0.0.1:3000/`。

## Supabase 协作方式

团队成员不应该直接在共享 Supabase Dashboard 里随手建表或改表。数据库结构属于工程代码的一部分，必须通过 migration 进入 Git。

推荐环境分层：

- **个人 local**：每位开发者在自己电脑上运行本地 Supabase，用于开发、试错和 AI Coding。
- **共享 staging**：团队联调用，只有合并后的 migration 才能进入。
- **production**：只由 Supabase Maintainer 或 CI 迁移，不能手工改 schema。

常见流程：

```bash
git checkout -b feature/GNE-89-user-profiles
supabase migration new create_user_profiles
supabase db reset
pnpm typecheck
pnpm build
```

详细规范见 `context/supabase-workflow.md`。涉及 Supabase 的 PR 必须说明 migration、RLS、seed、类型更新和部署影响。

## 团队分工

本工程按 Linear Milestones 分工。每个成员可以认领一个能力域，也可以在同一能力域下认领小 Issue。

| Milestone | 方向 | 典型负责人 | 代码和文档位置 |
| --- | --- | --- | --- |
| M0 工程基础与 AI 协作规则 | 仓库、规范、README、CI、AI 规则 | 工程 Owner | `AGENTS.md`、`context/`、根配置 |
| M1 产品外壳与可复用 UI | 首页、导航、Dashboard、状态组件 | 前端 / UI Owner | `apps/web`、`packages/ui` |
| M2 登录系统与用户账户 | 注册、登录、会话、账户设置 | Auth Owner | `apps/web`、`integrations/supabase.md` |
| M3 计费、订阅与权益模型 | pricing、权益判断、订阅状态 | Billing Owner | `packages/core`、`specs/` |
| M4 支付 Provider 与结账闭环 | sandbox 支付、checkout、webhook | Payment Owner | `integrations/payment.md`、`apps/web` |
| M5 数据监控与转化事件 | 事件命名、adapter、漏斗 | Analytics Owner | `integrations/analytics.md`、`packages/core` |
| M6 部署运维与线上验收 | Vercel、环境变量、smoke test | Deploy Owner | `integrations/vercel.md`、`.env.example` |
| M7 增长营销与反馈闭环 | SEO、落地页、归因、反馈入口 | Growth Owner | `apps/web`、`specs/` |

建议每个功能都保持这个节奏：

1. 在 Linear 认领或拆分 Issue。
2. 在 `specs/` 下复制 `_template`，补充产品规格和工程规格。
3. 开发前让 AI 读取 `AGENTS.md`、`context/status.md`、相关 `specs/` 和 `integrations/`。
4. 让 AI 先输出简短计划，确认影响范围后再改代码。
5. 实现后运行相关检查，补充验收记录。
6. 更新 `context/status.md` 和 Linear 状态。

## AI 协作最佳实践

本仓库是为了 AI 辅助迭代而组织的。给 AI 提需求时，不要只说“帮我做登录”或“帮我接支付”，而要把任务、范围、文档、验收标准说清楚。

推荐提示词结构：

```text
我正在处理 Linear Issue: <Issue ID 和标题>。

目标：
<用 2-4 句话说明要实现什么业务结果>

请先读取：
- AGENTS.md
- context/status.md
- context/architecture.md
- <相关 specs 文件>
- <相关 integrations 文件>

范围：
- 允许修改：<列出目录或文件>
- 不要修改：<列出非目标范围>

实现要求：
- <关键技术约束>
- <边界状态>
- <安全或隐私要求>

验收方式：
- <用户路径>
- <要运行的检查命令>
- <需要更新的文档或 Linear 状态>

请先给出实现计划，等我确认后再开始改代码。
```

### 示例 1：实现登录模块

```text
我正在处理 Linear Issue: GNE-87 AUTH-02 实现注册、登录和退出。

目标：
在现有 Next.js 应用中接入 Supabase Auth 的注册、登录和退出流程，让用户可以完成基础账号登录闭环。

请先读取：
- AGENTS.md
- context/status.md
- context/architecture.md
- integrations/supabase.md
- specs/auth/product-spec.md
- specs/auth/engineering-spec.md

范围：
- 允许修改 apps/web 中的认证页面、受保护路由入口和必要的服务封装。
- 允许在 packages/core 中增加用户会话相关类型。
- 不要引入真实密钥，不要把 Supabase 调用散落到多个无关页面。

实现要求：
- 未登录访问受保护页面时要有明确跳转或提示。
- 登录失败、加载中、空表单、网络失败都要有可见状态。
- 环境变量只能通过 .env.example 说明，不要提交真实值。

验收方式：
- 说明注册、登录、退出的手动验证路径。
- 运行 pnpm typecheck 和 pnpm build。
- 更新 context/status.md 中对应进度。

请先给出实现计划，等我确认后再开始改代码。
```

### 示例 2：实现 Sandbox 支付闭环

```text
我正在处理 Linear Issue: GNE-96 PAYMENT-01 实现 Sandbox Payment Provider。

目标：
先不接真实支付平台，在本地实现一个可测试的 sandbox provider，用来验证 pricing plan、checkout、支付成功和支付失败的产品路径。

请先读取：
- AGENTS.md
- context/status.md
- integrations/payment.md
- context/architecture.md
- specs/payment/product-spec.md
- specs/payment/engineering-spec.md

范围：
- 允许修改 packages/core 中的支付领域类型和 provider interface。
- 允许修改 apps/web 中的 checkout demo 页面。
- 不要选择真实支付 Provider，不要引入真实 SDK，不要处理真实银行卡或个人支付信息。

实现要求：
- provider-specific 逻辑必须被 adapter 包住。
- 支付成功、失败、取消、重复回调都要有明确状态。
- 后续替换真实 Provider 时，业务层接口尽量不变。

验收方式：
- 给出 sandbox 支付成功和失败的手动验证路径。
- 运行 pnpm typecheck 和 pnpm build。
- 补充或更新相关 specs。

请先给出实现计划，等我确认后再开始改代码。
```

### 示例 3：优化数据监控接入

```text
我正在处理 Linear Issue: GNE-102 ANALYTICS-02 建立 analytics provider adapter。

目标：
建立统一 analytics adapter，让访问、注册、登录、支付转化等事件可以先接 PostHog，未来也能替换或增加国内友好分析服务。

请先读取：
- AGENTS.md
- context/status.md
- integrations/analytics.md
- context/architecture.md

范围：
- 允许修改 packages/core 中的事件命名和事件属性类型。
- 允许在 apps/web 中增加最小的 provider 初始化和调用入口。
- 不要在业务页面中直接到处调用第三方 SDK。

实现要求：
- 事件名和属性需要类型化。
- 未配置 provider 时不能影响主流程。
- 要说明哪些事件属于 MVP 必须上报。

验收方式：
- 本地未配置真实 key 时应用仍可运行。
- 运行 pnpm typecheck 和 pnpm build。
- 更新 integrations/analytics.md 的接入说明。

请先给出实现计划，等我确认后再开始改代码。
```

### 示例 4：实现产品外壳和状态组件

```text
我正在处理 Linear Issue: GNE-85 APP-05 建立空状态、加载状态、错误状态和长内容约束。

目标：
为 Dashboard 和后续业务页面提供统一的基础状态组件，避免每个页面重复处理 loading、empty、error 和长内容布局问题。

请先读取：
- AGENTS.md
- context/status.md
- context/architecture.md
- specs/app-shell/product-spec.md
- specs/app-shell/engineering-spec.md

范围：
- 允许修改 packages/ui 中的通用组件。
- 允许修改 apps/web 的示例页面来展示这些状态。
- 不要大幅重做当前视觉风格。

实现要求：
- 组件要支持移动端和桌面端。
- 文案不能溢出容器。
- 状态组件不能依赖具体业务数据结构。

验收方式：
- 在本地页面展示 loading、empty、error、long content 四种状态。
- 运行 pnpm typecheck 和 pnpm build。
- 必要时补充组件使用说明。

请先给出实现计划，等我确认后再开始改代码。
```

### 示例 5：准备 Preview Deployment

```text
我正在处理 Linear Issue: GNE-108 DEPLOY-03 配置 Preview Deployment。

目标：
把当前工程连接到 Vercel Preview Deployment，让每个 PR 都能生成可访问的预览地址。

请先读取：
- AGENTS.md
- context/status.md
- integrations/vercel.md
- .env.example

范围：
- 允许修改部署配置和文档。
- 不要提交真实环境变量。
- 不要直接推送代码或操作远程仓库，除非我明确批准。

实现要求：
- 列出 Vercel 需要配置的环境变量。
- 说明 Preview 和 Production 的差异。
- 提供部署后的 smoke test 路径。

验收方式：
- pnpm build 通过。
- Preview URL 可访问。
- 更新 context/status.md 和 integrations/vercel.md。

请先给出计划，并明确哪些步骤需要我在 Vercel 或 GitHub 上手动确认。
```

## 给开发者的约定

- 开发前先看 Linear Issue，不要凭感觉扩大范围。
- 涉及外部服务时，先看 `integrations/`，不要把真实密钥写进仓库。
- 涉及 Supabase schema / RLS / seed 时，先看 `context/supabase-workflow.md`，必须通过 migration 变更数据库。
- 涉及业务规则时，优先放在 `packages/core`，让 UI 和服务层复用。
- 涉及通用界面时，优先放在 `packages/ui`，不要绑定具体页面数据。
- 涉及页面流程时，放在 `apps/web`，保持路由和用户体验清晰。
- 完成功能后同步更新规格、状态文档和 Linear 状态。

## 当前状态

当前仓库已经完成初始化结构、AI 上下文文档、SDD 模板、集成文档模板、基础 Next.js 应用和 Linear 任务树。后续真实业务能力会按 Linear Milestones 逐步接入。

已验证：

- TypeScript 检查通过。
- Next.js 生产构建通过。
- 本地开发服务可访问 `http://127.0.0.1:3000/`。
