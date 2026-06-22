# Creem 支付 Provider 人工验证记录

## 基本信息

- Linear: `GNE-99 PAYMENT-07 [RESEARCH][MVP2 可选] 真实支付 Provider 人工验证清单`
- Provider: Creem
- 验证阶段: test mode / sandbox mode only
- Live payment: disabled
- 验证人:
- 验证日期: 2026-06-22
- 最终结论: `Go test mode`

> 这份文件只记录人工验证结论，不接入代码，不创建生产支付配置，不启用真实收款。
> 不要粘贴 API key、webhook secret、身份证件、银行卡、完整后台截图、真实客户数据或任何敏感凭证。

## MVP 边界

MVP2 的目标是确认 Creem 是否适合作为未来真实 Provider 的候选，并判断是否可以进入 `PAYMENT-08` test mode 技术打样。

MVP2 不做以下事情:

- 不开启 live payment
- 不接真实用户付款
- 不使用生产密钥
- 不处理真实退款、对账、发票、税务或分账
- 不把 Creem SDK 或真实 Provider 逻辑写进页面组件
- 不把 Creem 作为当前 Payment 主线阻塞项

## 当前项目价格映射

项目内当前 Billing 配置位于 `packages/core/src/billing.ts`。

| 内部价格 ID | 当前含义 | 类型 | 金额 | 币种 | 周期 | Creem 对应对象 | 验证状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `pro_monthly` | Pro 月订阅 | recurring | 19.00 | USD | month | Product ID: `prod_3TvLvuLXmwQseX16nFNyQE` | 产品已创建，checkout/webhook 待验证 |
| `ai_credit_pack_100k` | AI 额度包 100k tokens | one_time | 9.00 | USD | none | 待填写，不放 secret | 待验证 |

## Creem 产品创建记录

### 产品 1: Pro 订阅

- 产品名称: AI Web Starter Kit Pro
- 产品描述: 一个面向 AI Web 应用的 SaaS 模板工程，包含登录、数据模型、订阅权益、支付流程、AI 额度和数据分析等基础能力，帮助团队更快验证产品想法并上线 MVP。
- Creem Product ID: `prod_3TvLvuLXmwQseX16nFNyQE`
- 产品图片: 已使用 16:9 产品展示图 `integrations/assets/xwlc-product-banner-1600x900.png`
- 税收类别: 数字商品或服务
- 价格包含税费: no
- 是否支持订阅价格: yes
- 是否支持月付: yes
- 是否支持测试 checkout: go test mode by docs，真实 response 留到 `PAYMENT-08`
- 是否支持成功 URL: yes by docs，真实跳转留到 `PAYMENT-08`
- 是否支持取消 URL: unknown，留到 `PAYMENT-08`
- 是否支持失败 URL: unknown，留到 `PAYMENT-08`
- 产品功能展示: yes，Creem onboarding 支持添加功能说明；当前选择“私密备注”作为 SaaS 权益交付说明，不使用文件下载或许可证密钥。
- 备注: 当前只验证 test mode，不接入生产支付。Creem 示例显示通过 `POST https://api.creem.io/v1/checkouts` 创建 checkout。早期方形图标 `integrations/assets/xwlc-product-icon.png` 在 Creem 预览中比例不合适，后续改用 16:9 banner。

### 产品 2: AI 额度包

如果 Creem 支持同一个产品下同时配置订阅和一次性价格，可以不单独创建第二个产品；否则单独创建 AI credit pack 产品。

- 产品名称:
- 产品描述:
- 是否支持一次性价格: yes / no / unknown
- 是否支持测试 checkout: yes / no / unknown
- 是否支持成功 URL: yes / no / unknown
- 是否支持取消 URL: yes / no / unknown
- 是否支持失败 URL: yes / no / unknown
- 备注:

## Checkout 验证

| 验证项 | 结果 | 记录 |
| --- | --- | --- |
| 测试模式是否明确开启 | yes | Creem 左侧状态显示“测试模式开启”。 |
| 能否创建 test checkout | go test mode | 官方 Test Mode 文档确认 test endpoint `https://test-api.creem.io/v1/checkouts` 可创建 checkout；dashboard 未发现手动 checkout link 入口，进入 `PAYMENT-08` 用 test API/SDK 验证。 |
| checkout 是否返回 session/order/id | go test mode | 官方示例返回 `checkout.checkoutUrl`；webhook 示例包含 checkout id `ch_...`，进入 `PAYMENT-08` 记录真实 test response 字段。 |
| 成功支付后是否能跳转 success URL | yes / no / unknown | |
| 取消支付后是否能跳转 cancel URL | yes / no / unknown | |
| 失败支付后是否能跳转 failure URL | yes / no / unknown | |
| checkout 结果是否能在后台查看 | yes / no / unknown | |
| 是否支持订阅 checkout | go test mode | 官方文档包含 recurring product 和 checkout 创建示例；当前产品后台未发现手动入口，进入 `PAYMENT-08` 用 test API/SDK 验证。 |
| 是否支持一次性付款 checkout | yes / no / unknown | |

Creem checkout API 初步观察:

```text
Method: POST
Test endpoint: https://test-api.creem.io/v1/checkouts
Production endpoint: https://api.creem.io/v1/checkouts
Request body observed:
  product_id: prod_3TvLvuLXmwQseX16nFNyQE
  success_url: supported by official docs
Auth header:
  x-api-key: server-only secret
Response field indicated by sample:
  checkout_url / checkoutUrl
```

安全结论:

- `product_id` 不是密钥，可以记录到调研文档。
- `x-api-key` 是 server-only secret，不能放入 `NEXT_PUBLIC_*`，不能进入前端代码，不能提交 Git，不能贴 Linear。

## Webhook 验证

| 验证项 | 结果 | 记录 |
| --- | --- | --- |
| 是否可以配置 webhook endpoint | yes | Creem dashboard `API 和 Webhooks -> Webhook` 可创建 Webhook，Webhook 名称和 Webhook URL 必填。当前未保存，因为需要公网 HTTPS endpoint。 |
| 是否提供 webhook signing secret | yes by docs / not yet generated | 官方文档说明 webhook secret 在 Developers > Webhook 页面。当前未保存 webhook，因此未生成/查看 secret；不要写入本文件。 |
| 是否有 webhook 签名校验文档 | yes | 官方文档说明使用 `creem-signature` header，HMAC-SHA256 + webhook secret 校验 raw payload。 |
| 是否能在后台重放或测试 webhook | unknown | 创建页未显示重放能力；官方文档提到 Merchant dashboard 可手动 resend webhook events，待 test event 后验证。 |
| 是否提供 event id 用于幂等 | yes by docs | webhook payload 示例包含 event id `evt_...`。 |
| 是否提供 payment succeeded 事件 | yes by docs | 事件名为 `checkout.completed`。 |
| 是否提供 payment failed 事件 | partial | Dashboard 事件里未看到通用 `payment.failed`，但订阅失败/欠费可用 `subscription.unpaid`、`subscription.past_due` 表达。 |
| 是否提供 subscription created/active 事件 | yes by docs | 官方事件列表包含 `subscription.active`、`subscription.paid`。 |
| 是否提供 subscription canceled 事件 | yes by docs | 官方事件列表包含 `subscription.canceled`、`subscription.scheduled_cancel`。 |
| 是否提供 refund/chargeback 事件 | yes by docs | 官方事件列表包含 `refund.created`、`dispute.created`。 |

Dashboard Webhook event selection observed on 2026-06-22:

```text
13 of 13 events selected

checkout.completed
subscription.active
subscription.trialing
subscription.canceled
subscription.scheduled_cancel
subscription.paid
subscription.expired
subscription.unpaid
subscription.update
subscription.past_due
subscription.paused
refund.created
dispute.created
```

MVP2 mapping notes:

- Payment success: `checkout.completed`
- Subscription becomes usable: `subscription.active`
- Subscription recurring payment succeeds: `subscription.paid`
- Subscription cancellation: `subscription.canceled` / `subscription.scheduled_cancel`
- Subscription payment failure / billing risk: `subscription.unpaid` / `subscription.past_due`
- Refund: `refund.created`
- Dispute / chargeback risk: `dispute.created`

需要重点记录的字段名称:

```text
event_id:
event_type:
checkout_session_id:
order_id:
subscription_id:
customer_id:
product_id:
price_id:
amount:
currency:
status:
signature_header:
  creem-signature
```

## 环境变量候选

这些变量只是候选命名。真实值只能放在本地 ignored env 或 Vercel dashboard，不能写入 Git、Linear、README 或截图。

```text
PAYMENT_PROVIDER=creem
PAYMENT_MODE=test
PAYMENT_LIVE_ENABLED=false
PAYMENT_PROVIDER_SECRET=
PAYMENT_WEBHOOK_SECRET=
CREEM_WEBHOOK_ENDPOINT=
CREEM_PRO_MONTHLY_PRODUCT_ID=prod_3TvLvuLXmwQseX16nFNyQE
CREEM_PRO_MONTHLY_PRICE_ID=
CREEM_AI_CREDIT_PACK_100K_PRICE_ID=
```

安全边界:

- `PAYMENT_PROVIDER` / `PAYMENT_MODE` / `PAYMENT_LIVE_ENABLED` 是非 secret selector。
- `PAYMENT_PROVIDER_SECRET` / `PAYMENT_WEBHOOK_SECRET` 只能服务端使用，不能加 `NEXT_PUBLIC_`。
- Creem product id / price id 如果未来进入配置，也应由 Provider adapter 或服务端配置读取，不应散落在页面组件里。

## 账号与合规检查

| 检查项 | 结果 | 记录 |
| --- | --- | --- |
| 当前账号是否可以完成商户验证 | yes / no / unknown | |
| 是否允许 SaaS / AI web app / digital product | yes / no / unknown | |
| 是否支持个人主体或当前公司主体 | yes / no / unknown | |
| 是否支持目标收款国家/地区 | yes / no / unknown | |
| 是否支持 USD 结算 | yes / no / unknown | |
| 是否需要银行账户或税务信息 | yes / no / unknown | |
| 是否支持退款 | yes / no / unknown | |
| 是否支持发票或收据 | yes / no / unknown | |
| 是否有争议/拒付处理入口 | yes / no / unknown | |
| 是否要求隐私政策、服务条款或客服邮箱 | yes / no / unknown | |

KYC / account review observation on 2026-06-22:

- 入口: non-test mode account review / KYC onboarding.
- Country of Tax Residency: asks where the merchant currently files personal taxes.
- Review prerequisites shown by Creem:
  - confirm the product is not in the Prohibited Products documentation.
  - confirm the product conforms to the account review checklist.
  - acknowledge that if the product is rejected, another review will not be conducted for 3 months.
- Current blocker: the team is still building a reusable MVP starter kit rather than a concrete production vertical product. Creem review asks for a clear product, so production KYC should not be forced at MVP2.
- Safety decision: do not submit production KYC, prohibited-product attestation, or account review until a real product, legal/product scope, policy pages, support contact, refund terms, and production-payment readiness are defined.

## 风险与限制

- 产品品类风险:
- 账号/KYC 风险: Production account review requires a clear product and explicit prohibited-product/checklist attestation. MVP2 currently lacks a real vertical product, so KYC is blocked by product readiness rather than by the Creem test-mode API itself.
- 结算/提现风险:
- webhook/技术接入风险:
- 税务/发票/合规风险:
- 用户退款/争议风险:
- 其他:

## 与当前项目架构的匹配度

| 项目要求 | Creem 是否满足 | 说明 |
| --- | --- | --- |
| 能映射 `pro_monthly` 订阅 | yes / no / unknown | |
| 能映射 `ai_credit_pack_100k` 一次性额度包 | yes / no / unknown | |
| 能提供 checkout session id | yes / no / unknown | |
| 能提供 provider order id | yes / no / unknown | |
| 能提供 provider subscription id | yes / no / unknown | |
| webhook 可验证且可幂等 | yes / no / unknown | |
| test mode 与 live mode 明确隔离 | yes / no / unknown | |
| 可用服务端 secret 接入 | yes / no / unknown | |
| 不要求前端暴露 secret | yes / no / unknown | |

## PAYMENT-07 Reviewer Checklist 对照

`GNE-99` 标记 Done 的含义是: Creem 已完成 MVP2 所需人工调研，并输出 `Go test mode`，允许进入 `GNE-100 PAYMENT-08` test-mode-only spike。它不代表 production KYC、payout 或 live payment 已通过。

## 人工验证表

| Provider | Account | Product allowed | Test mode | Webhook | Env needed | Payout | Risks | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Creem | Test dashboard 可访问，test mode 可开启，Developers / API keys / Webhooks 可访问；production KYC/account review 因缺少真实垂直产品暂停 | 已创建 `AI Web Starter Kit Pro`，可表达 Pro monthly subscription；Product ID: `prod_3TvLvuLXmwQseX16nFNyQE`；AI credit pack 是否单独产品后置 | 已确认 test mode 与 production mode 隔离；官方 test checkout endpoint 为 `https://test-api.creem.io/v1/checkouts`；真实 response 字段进入 `PAYMENT-08` | 可创建 Webhook；支持 13 个事件；签名 header 为 `creem-signature`；真实 webhook secret、payload、replay 和 public HTTPS endpoint 进入 `PAYMENT-08` | `PAYMENT_PROVIDER=creem`、`PAYMENT_MODE=test`、`PAYMENT_LIVE_ENABLED=false`；`PAYMENT_PROVIDER_SECRET` / `CREEM_API_KEY` server-only；`PAYMENT_WEBHOOK_SECRET` server-only；`CREEM_PRO_MONTHLY_PRODUCT_ID=prod_3TvLvuLXmwQseX16nFNyQE` | 未作为 MVP2 通过项；production KYC 前置于 payout/settlement，后置到 `GNE-201` | production KYC 要求明确真实产品、prohibited products 确认、account review checklist 确认；被拒后 3 个月不能再次 review；不能使用 production key/live payment | `Go test mode`，仅允许 `GNE-100` test-mode-only spike；生产支付进入 `GNE-201` |

| Checklist 项 | 结论 | 说明 |
| --- | --- | --- |
| 区分 `PAY-KNOW-01` 与本任务 | done | `PAY-KNOW-01` 记录支付能力知识共识；本文件记录 Creem 人工证据。 |
| Creem 账号验证 | partial / enough for test mode | Dashboard、test mode、Developers / API keys / Webhooks 可访问；production KYC 暂停。 |
| 产品验证 | done for Pro subscription | 已创建 `AI Web Starter Kit Pro`，Product ID 为 `prod_3TvLvuLXmwQseX16nFNyQE`；AI credit pack 是否单独产品后置。 |
| test mode 验证 | done for entry | 已确认 test mode 开启和官方 test endpoint；真实 response 字段进入 `PAYMENT-08`。 |
| webhook 验证 | done for entry | 已确认可创建 webhook、13 个事件和 `creem-signature`；真实 secret/payload/replay 进入 `PAYMENT-08`。 |
| payout / settlement 验证 | deferred | Production KYC 前置于 payout/settlement；当前 MVP2 不是具体垂直产品，后置到 `GNE-201`。 |
| 风险验证 | done | 已识别 production KYC、prohibited products、review checklist、被拒 3 个月、secret 泄露、webhook endpoint、live payment 边界风险。 |
| secret 安全 | done | API key / webhook secret 不进入 Git、Linear、README、截图或 `NEXT_PUBLIC_*`。 |
| 输出结论 | done | `Go test mode`，仅允许 `GNE-100` test-mode-only spike。 |

后置关系:

- `GNE-100 PAYMENT-08`: 验证真实 test checkout API response、success/cancel/failure、test webhook payload、signature、幂等字段和 adapter 映射。
- `GNE-201 Production Payment`: 验证 production KYC、live payment、production key、payout/settlement、真实退款、对账、发票、税务和分账。

## 最终判断

请选择一个:

- `Go test mode`: 可以进入 `PAYMENT-08`，只使用 test mode / sandbox mode 做技术打样。
- `Need more info`: 信息不足，需要继续查文档、问客服或补充账号验证。
- `No-go for now`: 当前不适合作为候选 Provider，暂不进入技术打样。

## PAYMENT-08 启动判断

`PAYMENT-07` 的人工调研已经足够支持进入 `PAYMENT-08`，但只限 Creem test mode 技术打样:

- Test mode 已开启。
- Pro subscription 产品已创建。
- Creem dashboard 存在 Developers / API keys / Webhooks 入口。
- Webhook 创建页可配置 Webhook URL，并支持 13 个事件。
- Webhook 事件覆盖 checkout、subscription lifecycle、refund、dispute。
- 官方文档确认 test API endpoint 为 `https://test-api.creem.io/v1/checkouts`。
- 官方文档确认 test API key 与 production API key 隔离。
- 官方文档确认 webhook signature header 为 `creem-signature`。
- Production KYC/account review 因缺少真实垂直产品而暂停，不影响 test-mode spike，但阻止 live payment。

`PAYMENT-08` 的第一步不应直接接生产代码，而应做最小 test-mode spike。验收目标不是只拿到 API response，而是能在 Creem test mode 后台看到一笔测试 checkout / payment 记录:

1. 创建 test API key，不写入 Git/Linear/截图。
2. 在 ignored local env 中放入 test key。
3. 用 `PAYMENT_PROVIDER=creem`、`PAYMENT_MODE=test`、`PAYMENT_LIVE_ENABLED=false` 做本地受控验证。
4. 调用 test checkout API，记录返回字段，不记录 secret。
5. 打开返回的 checkout URL，用 Creem test card 完成测试支付。
6. 回到 Creem test mode dashboard，确认 payment / checkout / subscription 相关记录出现。
7. 记录 checkout id、checkout URL 是否可打开、支付后后台记录是否出现、跳转 URL 是否符合预期；不要记录 API key、webhook secret、完整客户卡号或敏感截图。
8. Webhook 只用 public HTTPS test endpoint 或后续 ngrok/Vercel preview 验证，不在 PAYMENT-07 保存空 webhook。

最小验证脚本:

```bash
pnpm payment:creem:test-checkout
```

脚本读取本地 ignored env，不打印 API key / webhook secret。PAYMENT-08 本地环境可以持久切到 Creem test mode:

```text
PAYMENT_PROVIDER=creem
PAYMENT_MODE=test
PAYMENT_LIVE_ENABLED=false
PAYMENT_PROVIDER_SECRET=your_creem_test_api_key
CREEM_PRO_MONTHLY_PRODUCT_ID=prod_3TvLvuLXmwQseX16nFNyQE
CREEM_CHECKOUT_SUCCESS_URL=https://your-preview-or-production-url/account/payment/result?status=success&price_id=pro_monthly
```

如果缺少 key、product id 或 HTTPS success URL，脚本会在发送请求前停止。

人工验收 checklist:

- `pnpm payment:creem:test-checkout` 返回 test checkout URL。
- checkout URL 可在浏览器打开。
- 使用 Creem test card 能完成一次测试支付。
- Creem test mode dashboard 能看到对应 test payment / checkout / subscription 记录。
- 本项目没有启用 live payment，`PAYMENT_LIVE_ENABLED=false`。
- 没有把 API key、webhook secret、卡号、身份证件或敏感截图写进 Git / Linear / README。

生产支付仍然不准入:

- 不提交 KYC。
- 不使用 production API key。
- 不启用 live payment。
- 不接真实用户付款。
- 不处理真实退款、对账、发票、税务或分账。

结论: Go test mode

原因: Creem test mode、Pro 产品、订阅/月付价格、产品图片、产品功能展示、Developers/API/Webhook 入口、Webhook 事件列表和官方 test checkout API 已确认，足以进入 `PAYMENT-08` 做 test-mode-only 技术打样；production KYC/account review 会要求明确产品、prohibited products/checklist 承诺和被拒 3 个月限制，当前 MVP2 不是具体垂直产品，因此 production KYC/live payment 仍不准入。

下一步: 启动 `PAYMENT-08`。需要人工在 Creem test mode 创建 test API key，并只放入本地 ignored env 或受控 secret manager；Codex 只能读取/使用本地环境变量，不接收、不记录、不提交 key。生产认证和 live payment 留到 `GNE-201` 或真实垂直产品阶段。
