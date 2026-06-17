# Linear Tracking

## Project

- Name: `Web 端的可商用模板工程`
- Short ID: `98f7dceca282`
- Project UUID: `55cd8118-82ed-4c12-a977-f5b117d3a5e7`
- URL: <https://linear.app/gnemux/project/web-端的可商用模板工程-98f7dceca282>

## Milestones

```text
M0 工程基础与 AI 协作规则
├── ID: 67415612-48ac-4769-b331-6b165d58a711
└── Main issue: GNE-11 FOUNDATION-00

M1 产品外壳与可复用 UI
├── ID: 2b98df48-1869-4005-aa90-bc1253405a04
└── Main issue: GNE-70 APP-00

M2 登录系统与用户账户
├── ID: cb6f022d-7dcc-4949-be42-30ba969ce4ff
└── Main issue: GNE-5 AUTH-00

M3 计费、订阅与权益模型
├── ID: a1f0df17-7deb-4c42-ab93-f0afa3d5ce01
└── Main issue: GNE-71 BILLING-00

M4 支付 Provider 与结账闭环
├── ID: 347539e6-aee5-4a2d-a64c-189fa54720a6
└── Main issue: GNE-72 PAYMENT-00

M5 数据监控与转化事件
├── ID: d9d0323d-1b92-4a9b-ada7-1e63d2599e2c
└── Main issue: GNE-73 ANALYTICS-00

M6 部署运维与线上验收
├── ID: 5eed1508-a480-44d1-aa39-efebe17dd4f9
└── Main issue: GNE-74 DEPLOY-00

M7 增长营销与反馈闭环
├── ID: f85fc4d2-304b-406b-94aa-12f303b0acbc
└── Main issue: GNE-75 GROWTH-00
```

## Baseline Issue Tree

Created on 2026-06-17.

```text
GNE-11 FOUNDATION-00 [FOUNDATION] GitHub 仓库基础与 AI 协作规则
├── GNE-14 FOUNDATION-01 [DOC] 写好 README：说明工程目标、结构、分工和 SDD 流程
├── GNE-76 FOUNDATION-02 [DOC] 建立 AGENTS.md 与 Codex 执行规则
├── GNE-77 FOUNDATION-03 [DOC] 建立 context 项目上下文文档
├── GNE-78 FOUNDATION-04 [DOC] 建立 SDD 规格模板
├── GNE-79 FOUNDATION-05 [DOC] 建立第三方集成文档模板
├── GNE-80 FOUNDATION-06 [CI] 配置基础检查：lint、typecheck、build
└── GNE-116 FOUNDATION-07 [DOC] 建立 Supabase 多人数据库协作规范

GNE-70 APP-00 [APP] 产品外壳与可复用 UI
├── GNE-81 APP-01 [APP] 初始化 Next.js + TypeScript Web 应用
├── GNE-82 APP-02 [APP] 建立应用外壳：导航、布局、基础页面容器
├── GNE-83 APP-03 [UI] 建立首页与营销落地页基础模板
├── GNE-84 APP-04 [UI] 建立 Dashboard 基础框架
└── GNE-85 APP-05 [UI] 建立空状态、加载状态、错误状态和长内容约束

GNE-5 AUTH-00 [AUTH] 主流登录系统集成：注册、登录、会话和用户资料
├── GNE-86 AUTH-01 [DOC] 编写 Supabase Auth 集成边界
├── GNE-87 AUTH-02 [DEV] 实现注册、登录和退出
├── GNE-88 AUTH-03 [DEV] 实现会话读取和受保护路由
├── GNE-89 AUTH-04 [DEV] 建立用户资料和账户设置页
└── GNE-90 AUTH-05 [TEST] 验证完整登录链路

GNE-71 BILLING-00 [BILLING] 计费、订阅与权益模型
├── GNE-91 BILLING-01 [DOC] 定义计费领域模型
├── GNE-92 BILLING-02 [DEV] 建立权益判断接口
├── GNE-93 BILLING-03 [DEV] 建立 pricing plan 配置模型
├── GNE-94 BILLING-04 [DEV] 建立订阅状态和生命周期处理
└── GNE-95 BILLING-05 [TEST] 验证权益和订阅状态边界

GNE-72 PAYMENT-00 [PAYMENT] 支付 Provider 与结账闭环
├── GNE-96 PAYMENT-01 [DEV] 实现 Sandbox Payment Provider
├── GNE-97 PAYMENT-02 [DEV] 建立 checkout demo flow
├── GNE-98 PAYMENT-03 [DEV] 建立 webhook 验签与幂等规范
├── GNE-99 PAYMENT-04 [DECISION] 选择第一个真实支付 Provider
└── GNE-100 PAYMENT-05 [TEST] 验证真实 Provider 测试闭环

GNE-73 ANALYTICS-00 [ANALYTICS] 数据监控与转化事件
├── GNE-101 ANALYTICS-01 [DOC] 定义 analytics 事件命名和属性规范
├── GNE-102 ANALYTICS-02 [DEV] 建立 analytics provider adapter
├── GNE-103 ANALYTICS-03 [DEV] 接入访问、注册、登录和核心功能事件
├── GNE-104 ANALYTICS-04 [DEV] 接入支付转化事件
└── GNE-105 ANALYTICS-05 [TEST] 验证生产环境事件上报

GNE-74 DEPLOY-00 [DEPLOY] 部署、环境变量与线上验收
├── GNE-106 DEPLOY-01 [DOC] 编写 Vercel 部署规范
├── GNE-107 DEPLOY-02 [DOC] 建立环境变量清单和 .env.example
├── GNE-108 DEPLOY-03 [DEPLOY] 配置 Preview Deployment
├── GNE-109 DEPLOY-04 [TEST] 验证生产 smoke path
└── GNE-110 DEPLOY-05 [DOC] 建立上线状态回写和故障排查记录

GNE-75 GROWTH-00 [GROWTH] 增长营销基础能力
├── GNE-111 GROWTH-01 [DOC] 定义 SEO baseline
├── GNE-112 GROWTH-02 [UI] 建立营销落地页模块
├── GNE-113 GROWTH-03 [DEV] 建立 campaign attribution 基础能力
├── GNE-114 GROWTH-04 [DEV] 建立用户反馈收集入口
└── GNE-115 GROWTH-05 [DOC] 整理推广渠道和发布 checklist
```

## Usage

Use Linear as the source of task progress and this repository as the source of implementation truth. When Linear and repository docs disagree, update the stale side before implementation continues.

## Project Documents

- Supabase 多人数据库协作规范: <https://linear.app/gnemux/document/supabase-多人数据库协作规范-04fd323ff596>
