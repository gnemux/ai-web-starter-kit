# XWLC

XWLC 是 XUMENG、WANGWEI、LIZUZHUANG、CHUYI 四位中年人在工作与家庭之余共同构建中的梦想。

它既是 `eXtensible Web Launch Core` 的缩写，也来自四个名字的首字母。这个工程希望成为一个干净、克制、可生长的 Web 产品启动核心，让新的想法可以更快从规格走向可验证的产品。

## 技术栈

| 领域 | 技术 |
| --- | --- |
| Runtime | Node.js 22 |
| 包管理 | pnpm 9.15 workspace |
| 任务编排 | Turborepo |
| Web 应用 | Next.js App Router |
| UI | React 19, Tailwind CSS |
| 语言 | TypeScript |
| Auth / Database | Supabase |
| Analytics | PostHog adapter |
| Deployment | Vercel |

## 工程结构

```text
.
├── apps/
│   └── web/              # Next.js Web 应用
├── packages/
│   ├── core/             # 业务类型、纯逻辑和服务契约
│   └── ui/               # 可复用 UI 组件
├── specs/                # 产品规格、工程规格、验收和测试计划
├── context/              # 项目上下文、状态和协作规则
├── integrations/         # 第三方服务接入说明
├── supabase/             # 数据库 migrations、seed 和本地配置
├── AGENTS.md             # Codex / AI Agent 工作规则
├── package.json          # 根脚本
├── pnpm-workspace.yaml   # workspace 配置
└── turbo.json            # Turborepo 配置
```

## 协作入口

- MVP 路线与阶段边界：`context/project.md`
- Linear issue 树镜像与执行顺序：`context/linear.md`
- 当前完成状态、风险和下一步：`context/status.md`
- 环境、部署和生产验收记录：`context/environment-matrix.md`、`context/deployment-status.md`
- Provider matrix、配置验收与第三方接入约定：`integrations/provider-matrix.md`、`integrations/provider-config-checklist.md`、`integrations/`
- Provider contract 与 adapter 目录约定：`packages/core/src/providers.ts`、`apps/web/lib/providers/`

## 启动方式

启用固定 pnpm 版本：

```bash
corepack prepare pnpm@9.15.0 --activate
```

安装依赖：

```bash
pnpm install
```

启动开发环境：

```bash
pnpm dev
```

常用检查：

```bash
pnpm typecheck
pnpm lint
pnpm build
```

默认访问地址：

```text
http://localhost:3000
```

如果 `3000` 端口已被占用，Next.js 会自动选择下一个可用端口。
