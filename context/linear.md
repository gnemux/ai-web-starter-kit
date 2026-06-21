# Linear Tracking

## Project

- Name: `Web 端的可商用模板工程`
- Short ID: `98f7dceca282`
- Project UUID: `55cd8118-82ed-4c12-a977-f5b117d3a5e7`
- URL: <https://linear.app/gnemux/project/web-端的可商用模板工程-98f7dceca282>

## Project Milestones

```text
MVP1 基础底座
├── ID: 67415612-48ac-4769-b331-6b165d58a711
└── Parent issues: GNE-11, GNE-70, GNE-132, GNE-133, GNE-5, GNE-74

MVP2 扩展底座
├── ID: a1f0df17-7deb-4c42-ab93-f0afa3d5ce01
├── Parent issues: GNE-167, GNE-71, GNE-72, GNE-148, GNE-73
└── Consensus issue: GNE-190

MVP3 Product Validation Kit
├── ID: f85fc4d2-304b-406b-94aa-12f303b0acbc
└── Parent issues: GNE-171, GNE-75

MVP4 国内外双模式底座
├── ID: 5eed1508-a480-44d1-aa39-efebe17dd4f9
└── Parent issues: GNE-193

MVP5 真实海外垂直产品验证
├── ID: 347539e6-aee5-4a2d-a64c-189fa54720a6
└── Reserved milestone; detailed execution issues are not split yet.

MVP6 国内版真实落地
├── ID: 3a7c65e8-425f-4e26-a6bd-20d691662b61
└── Reserved milestone; detailed execution issues are not split yet.

LEGACY-M1 已并入 MVP1（不再使用）
├── ID: 2b98df48-1869-4005-aa90-bc1253405a04
└── Historical module milestone; do not assign new issues.

LEGACY-M2 已并入 MVP1（不再使用）
├── ID: f2796ef9-b542-48c6-8b69-2b464c7d43bf
└── Historical module milestone; do not assign new issues.

LEGACY-M3 已并入 MVP1（不再使用）
├── ID: d3a1e9b4-0472-4468-93e6-ae9d2ce3a110
└── Historical module milestone; do not assign new issues.

LEGACY-M4 已并入 MVP1（不再使用）
├── ID: cb6f022d-7dcc-4949-be42-30ba969ce4ff
└── Historical module milestone; do not assign new issues.

LEGACY-M7 已拆入 MVP1/MVP2/MVP3（不再使用）
├── ID: d9d0323d-1b92-4a9b-ada7-1e63d2599e2c
└── Historical module milestone; do not assign new issues.
```

Milestone display rule: assign MVP milestones only to module parent issues. Execution child issues should use `No milestone` and be reached through their parent issue. This keeps the Linear project milestone view focused on stage/module entry points instead of every implementation task.

## MVP Stage Overlay

Updated on 2026-06-20 from `GNE-172` MVP factory route consensus, `GNE-190` MVP2 consensus, the `GNE-74` DEPLOY planning cleanup, the `GNE-73` ANALYTICS PostHog planning cleanup, and the MVP3/MVP4 boundary cleanup.

The project now keeps two planning views at the same time:

- Stage view: `MVP1`, `MVP2`, `MVP3`, and `MVP4` explain what each delivery stage proves.
- Module view: parent issues keep engineering ownership, specs, and implementation boundaries.

```text
MVP1 基础底座
├── GNE-11 MVP1 FOUNDATION-00
├── GNE-70 MVP1 APP-00
├── GNE-132 MVP1 DATA-00
├── GNE-133 MVP1 API-00
├── GNE-5 MVP1 AUTH-00
└── GNE-74 MVP1 DEPLOY-00

MVP2 扩展底座
├── GNE-190 MVP2-KNOW-01
├── GNE-167 MVP2 INTEGRATIONS-00
├── GNE-71 MVP2 BILLING-00
├── GNE-72 MVP2 PAYMENT-00
├── GNE-148 MVP2 AI-00
└── GNE-73 MVP1-MVP3 ANALYTICS-00

MVP3 Product Validation Kit
├── GNE-171 MVP3 PRODUCT-00
├── GNE-75 MVP3 GROWTH-00
├── GNE-194 MVP3-CP-07 real Payment provider acceptance
└── GNE-195 MVP3-CP-08 real AI provider acceptance

MVP4 国内外双模式底座
└── GNE-193 MVP4 INTEGRATIONS-00
```

`GNE-168` records the detailed MVP1-MVP4 mapping. `GNE-190` is an MVP2 consensus document, not an implementation parent. `GNE-167` is now MVP2-only integrations: provider matrix, env naming, mock/no-op/sandbox strategy, and interface boundaries. `GNE-193` owns MVP4 real overseas / China dual-mode provider rollout.

MVP3 core execution remains `GNE-173` through `GNE-179`. Real Payment and real AI provider product acceptance are conditionally split into `GNE-194` and `GNE-195` so MVP3 can validate the product loop with sandbox/mock/no-op paths first.

Execution tasks remain as child issues under the parent issue tree below. Examples: `GNE-180` through `GNE-183` stay under `GNE-167`, and `GNE-173` through `GNE-195` stay under `GNE-171`, but those child issues should not be directly assigned to Project Milestones.

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
├── GNE-85 APP-05 [UI] 建立空状态、加载状态、错误状态和长内容约束
└── GNE-165 APP-06 [I18N] 建立全局中英双语与界面文案约束

GNE-132 DATA-00 [DATA] 最小数据模型、migration 与 RLS 模板
├── GNE-134 DATA-01 [DOC] 定义数据建模边界与最小表结构
├── GNE-135 DATA-02 [DEV] 建立基础 Supabase migration：user_profiles 与 demo_items
├── GNE-136 DATA-03 [DEV] 建立 RLS policy 模板：owner-only、public-read、service-only
├── GNE-137 DATA-04 [DEV] 建立 seed.sql 与本地 reset 验证入口
└── GNE-138 DATA-05 [TEST] 验证 migration、seed 与 RLS 权限边界

GNE-133 API-00 [API] Service 层与业务访问模板
├── GNE-139 API-01 [DOC] 定义页面、service、provider、database 的调用边界
├── GNE-140 API-02 [DEV] 建立 Supabase client/server helper 边界
├── GNE-141 API-03 [DEV] 建立 demo service：读取和创建 demo_items
├── GNE-142 API-04 [DEV] 建立输入校验、权限与错误返回格式
└── GNE-143 API-05 [TEST] 验证页面不直接散落查库，高权限逻辑不进客户端

GNE-5 AUTH-00 [AUTH] 主流登录系统集成：注册、登录、会话和用户资料
├── GNE-86 AUTH-01 [DOC] 编写 Supabase Auth 集成边界
├── GNE-87 AUTH-02 [DEV] 实现注册、登录和退出
├── GNE-88 AUTH-03 [DEV] 实现会话读取和受保护路由
├── GNE-89 AUTH-04 [DEV] 建立用户资料和账户设置页
├── GNE-163 AUTH-05 [ANALYTICS] 建立 Supabase Auth 的 PostHog 埋点
└── GNE-90 AUTH-06 [TEST] 验证完整登录链路与 PostHog 事件

GNE-190 MVP2-KNOW-01 [DOC] 商业化扩展底座共识与执行路线（Done）

GNE-71 MVP2 BILLING-00 [BILLING] 计费、订阅与权益模型（Done）
├── GNE-91 BILLING-01 [DOC][MVP2] 定义计费领域模型、状态流转与事实来源（Done）
├── GNE-191 BILLING-02 [DATA][MVP2] 建立最小 Billing 数据模型与 migration 草案（Done）
├── GNE-92 BILLING-03 [CORE/API][MVP2] 建立权益判断接口与 Billing service 边界（Done）
├── GNE-93 BILLING-04 [CONFIG][MVP2] 建立 pricing plan 配置模型（Done）
├── GNE-94 BILLING-05 [DEV][MVP2] 建立订阅状态和生命周期处理（Done）
├── GNE-157 BILLING-06 [AI][MVP2] Token allowance、credit 与 usage entitlement 模型（Done）
├── GNE-95 BILLING-07 [TEST][MVP2] 验证权益、订阅状态与账本边界（Done）
└── GNE-197 BILLING-08 [APP/REVIEW][MVP2] 建立 /account Billing 验收面（Done）

Billing reviewer surface: MVP2 owns `packages/core/src/billing.ts`, `specs/billing/*`, `supabase/migrations/20260621130735_create_billing_foundation.sql`, `apps/web/lib/services/billing.ts`, and the minimal `/account` Billing review section. Reviewers should be able to confirm Free / Pro / AI credit-pack config, domain rules, migration/RLS shape, service boundary, and visible Free/Pro differences before Payment, AI, or MVP3 consume Billing.

GNE-72 MVP2 PAYMENT-00 [PAYMENT] 支付 Provider 与结账闭环
├── GNE-192 PAYMENT-01 [DOC][MVP2] 定义 Payment provider 边界与 Sandbox contract
├── GNE-96 PAYMENT-02 [DEV][MVP2] 实现 Sandbox Payment Provider
├── GNE-97 PAYMENT-03 [DEV][MVP2] 建立 checkout demo flow
├── GNE-98 PAYMENT-04 [DEV][MVP2] 建立 webhook 验签、幂等与事件去重规范
├── GNE-198 PAYMENT-08 [APP/REVIEW][MVP2] 建立 checkout 与支付结果验收页面
├── GNE-99 PAYMENT-05 [DECISION][MVP2] 选择第一个真实支付 Provider
├── GNE-100 PAYMENT-06 [TEST][MVP2] 验证真实 Provider 测试闭环
└── GNE-158 PAYMENT-07 [AI][MVP2] Token 包、积分充值与订阅赠送额度 checkout flow

Payment reviewer surface: reviewers must be able to follow pricing or billing entry -> checkout started -> success, cancel, or failure result -> order, subscription, and entitlement status. Success URLs record navigation only and must not directly grant entitlement. Real provider validation still needs this page-level proof, not only webhook logs.

GNE-73 MVP1-MVP3 ANALYTICS-00 [ANALYTICS] 统一事件标准、生产验收与转化看板
├── GNE-101 ANALYTICS-01 [DOC][MVP1] 事件命名、shared properties 与隐私边界（Done）
├── GNE-123 ANALYTICS-02 [DEV][MVP1] 建立产品级 analytics 配置与环境变量入口（Done）
├── GNE-102 ANALYTICS-03 [DEV][MVP1] 建立 PostHog adapter、no-op 与 shared properties 注入（Done）
├── GNE-103 ANALYTICS-04 [DEV][MVP1] 接入 Auth 与 pageview 转化事件（Done）
├── GNE-188 ANALYTICS-05 [DEV][MVP3] 接入 activation 与核心功能事件
├── GNE-105 ANALYTICS-06 [TEST][MVP2] 验证 Production PostHog 事件接收与字段完整性（Done）
├── GNE-124 ANALYTICS-07 [DOC][MVP2/MVP3] 建立 PostHog 漏斗和看板模板
├── GNE-122 ANALYTICS-08 [DOC][MVP2] 定义多环境与多产品数据查看约定
├── GNE-125 ANALYTICS-09 [TEST][MVP2/MVP3] 验证单 Project 多环境/多产品数据隔离
├── GNE-104 ANALYTICS-10 [DEV][MVP2] 接入支付转化事件
└── GNE-159 ANALYTICS-11 [AI][MVP2] AI 使用量、成本与转化事件看板

GNE-74 DEPLOY-00 [DEPLOY] 部署、环境变量与线上验收
├── GNE-107 DEPLOY-01 [DOC] 建立环境变量清单与 .env.example
├── GNE-106 DEPLOY-02 [DOC] 编写 Vercel 部署规范
├── GNE-108 DEPLOY-03 [DEPLOY] 配置 Vercel Preview / Production 部署入口
├── GNE-185 DEPLOY-04 [TEST] 验证 Vercel 线上环境访问 Supabase
├── GNE-186 DEPLOY-05 [TEST] 验证 PostHog Production 埋点接收
├── GNE-109 DEPLOY-06 [TEST] 整合 Production Smoke Path 验收
├── GNE-110 DEPLOY-07 [DOC] 建立上线状态回写和故障排查记录
├── GNE-187 DEPLOY-08 [OPS] 建立生产监控与告警检查清单
└── GNE-129 DEPLOY-09 [DOC] 建立多环境 / 多产品配置预留清单

GNE-75 GROWTH-00 [GROWTH] 增长营销基础能力
├── GNE-111 GROWTH-01 [DOC] 定义 SEO baseline
├── GNE-112 GROWTH-02 [UI] 建立营销落地页模块
├── GNE-113 GROWTH-03 [DEV] 建立 campaign attribution 基础能力
├── GNE-114 GROWTH-04 [DEV] 建立用户反馈收集入口
├── GNE-115 GROWTH-05 [DOC] 整理推广渠道和发布 checklist
├── GNE-126 GROWTH-06 [DOC] 定义推广渠道与 UTM 命名规范
├── GNE-127 GROWTH-07 [DEV] 建立推广链接示例与 attribution 验证页面
├── GNE-128 GROWTH-08 [DOC] 建立增长复盘模板与行动规则
└── GNE-161 GROWTH-09 [AI] AI 产品 Demo 模板与落地页表达

GNE-148 MVP2 AI-00 [AI] AI Provider、Usage、Credit 与 Entitlement 底座
├── GNE-149 AI-01 [DOC][MVP2] 定义 AI provider、model、token、credit、entitlement 边界
├── GNE-156 AI-02 [API][MVP2] 定义 AI service 与 server-only 调用边界
├── GNE-150 AI-03 [DEV][MVP2] 建立 AI Provider Adapter 与模型配置结构
├── GNE-151 AI-04 [DEV][MVP2] 建立 AI Service 示例：chat、completion、embedding
├── GNE-152 AI-05 [DATA][MVP2] 建立 Token Usage 计量模型
├── GNE-153 AI-06 [DEV][MVP2] 建立 Credit / Quota Ledger 与订阅额度关联
├── GNE-154 AI-07 [DEV][MVP2] 建立 AI Entitlement Gate 与模型访问限制
├── GNE-199 AI-10 [APP/REVIEW][MVP2] 建立 AI demo 与额度验收页面
├── GNE-155 AI-08 [TEST][MVP2] 验证 AI key 安全、token 扣减幂等和额度边界
└── GNE-160 AI-09 [DEPLOY][MVP2] 模型 Provider secrets、预算上限与 production smoke test

AI reviewer surface: reviewers must be able to see an AI entry, input/prompt area, provider mode, entitlement or quota gate, mock/no-op or real result, usage or credit outcome, and failure states such as unauthenticated, insufficient entitlement, quota exhausted, model unavailable, and provider failure. Failed calls must not silently deduct credit.

GNE-167 MVP2 INTEGRATIONS-00 [INTEGRATIONS] Provider matrix、环境变量与 adapter 底座
├── GNE-180 MVP2-INT-01 [DOC][MVP2] 建立 provider matrix 与阶段边界
├── GNE-181 MVP2-INT-02 [DEV][MVP2] 建立 provider interface、mock/no-op adapter 与目录约定
├── GNE-182 MVP2-INT-03 [DOC/DEPLOY][MVP2] 标准化 env 命名、public/secret 分层与示例模板
└── GNE-183 MVP2-INT-04 [TEST][MVP2] 验证 provider 配置、no-op 行为与 secret 不泄漏

GNE-193 MVP4 INTEGRATIONS-00 [INTEGRATIONS] 海外/国内双模式真实 Provider 接入

GNE-171 MVP3 PRODUCT-00 [PD] Product Validation Kit / Indie 产品验证工作台
├── GNE-173 MVP3-CP-00 [DOC] 对齐 Product Validation Kit 规格与模板边界
├── GNE-174 MVP3-CP-01 [DATA/API/APP] 建立 projects 领域对象与 owner-only 链路
├── GNE-175 MVP3-CP-02 [DATA/API/APP] 建立公开验证页与 leads 匿名提交
├── GNE-176 MVP3-CP-03 [ANALYTICS/GROWTH] 建立验证页漏斗、UTM 与 PostHog 事件
├── GNE-177 MVP3-CP-04 [BILLING/PAYMENT] 建立 Free/Pro 权益、sandbox checkout 与 webhook 闭环
├── GNE-178 MVP3-CP-05 [EMAIL/OPS] 建立通知、失败记录与 admin 运营状态
├── GNE-179 MVP3-CP-06 [AI] 建立验证页 AI 文案生成与 usage credits
├── GNE-194 MVP3-CP-07 [PAYMENT][MVP3] 真实支付 Provider 产品化验收
└── GNE-195 MVP3-CP-08 [AI][MVP3] 真实 AI Provider 产品化验收

MVP3 reviewer surface: the product kit must be a clickable chain, not a collection of backend tasks. The minimum human check is login/signup -> project creation -> public validation page -> anonymous lead submission -> owner dashboard lead view -> Free/Pro gating -> sandbox checkout success/cancel/failure -> order/subscription/entitlement status -> AI generation -> usage/credit/quota result -> PostHog funnel evidence.
```

## Usage

Use Linear as the source of task progress and this repository as the source of implementation truth. When Linear and repository docs disagree, update the stale side before implementation continues.

## Project Documents

- Supabase 多人数据库协作规范: <https://linear.app/gnemux/document/supabase-多人数据库协作规范-04fd323ff596>
