# Cippus Web

Cippus Web 是一个面向学生成果管理与积分申报的 Nuxt 应用，提供竞赛、奖项、论文、专利、大创成果、活动申报、审核流和站内信通知等能力。项目基于 Nuxt 4、Vue 3、Nuxt UI v4、NuxtHub 和 Drizzle ORM 构建。

## 功能特性

- 公告与竞赛公开浏览、搜索和详情页。
- 用户个人主页与成果展示，可选择公开展示已审核成果。
- 奖项、论文、专利、大创成果的草稿、提交审核、回退草稿和审核结果通知。
- 积分活动申报，支持按活动规则计算成果分值、总分和有效分。
- 管理后台支持公告、竞赛、用户、活动、成果审核和申报管理。
- CAS 登录与本地用户名密码登录。
- 站内信通知审核结果，不依赖邮件推送。

## 技术栈

- Nuxt 4 + Vue 3
- Nuxt UI v4 + Tailwind CSS v4
- NuxtHub Core
- Drizzle ORM + PostgreSQL
- nuxt-auth-utils
- Zod
- pnpm

## 环境要求

- Node.js 版本以 Nuxt 4 支持范围为准。
- pnpm 10.x，项目声明为 `pnpm@10.32.1`。
- PostgreSQL 数据库。
- 可用的 CAS 配置；本地开发也可使用管理员创建的用户名密码账号登录。

## 快速开始

安装依赖：

```bash
pnpm install
```

复制环境变量并按需修改：

```bash
cp .env.example .env
```

准备数据库迁移：

```bash
pnpm nuxt db generate
```

启动开发服务器：

```bash
pnpm dev
```

默认访问地址为 `http://localhost:3000`。

## 环境变量

| 变量                    | 说明                           |
| ----------------------- | ------------------------------ |
| `NUXT_SESSION_PASSWORD` | 会话加密密钥，至少 32 个字符。 |
| `DATABASE_URL`          | PostgreSQL 连接字符串。        |
| `NUXT_CAS_BASE_URL`     | CAS 服务地址。                 |
| `NUXT_CAS_SERVICE_URL`  | CAS 回调服务地址。             |

`.env.example` 中可能保留历史邮件配置；当前业务约定是审核结果通过站内信发送，不再发送邮件。

## 常用命令

```bash
pnpm dev
pnpm build
pnpm nuxt typecheck
pnpm nuxt db generate
```

## 项目结构

```text
app/
  components/       通用 Vue 组件
  layouts/          前台与管理后台布局
  middleware/       客户端路由中间件
  pages/            Nuxt 页面
server/
  api/              Nitro API 路由
  db/schema.ts      Drizzle schema
  middleware/       服务端中间件
  routes/           非 /api 服务端路由
  utils/            服务端业务工具
shared/
  types/            共享类型与枚举
i18n/
  locales/          本地化文案
```

## 权限模型

- `/api/admin/**` 由 `server/middleware/admin.ts` 统一要求管理员会话。
- 公开 API 只承担读职责；公告、竞赛、活动、用户等管理写操作应放在 `/api/admin/**`。
- 用户成果写操作必须基于当前会话用户，不信任 URL、请求体或前端隐藏字段中的用户身份。
- API 返回用户信息时应使用显式字段白名单，避免返回 `password` 等敏感字段。

## 开发规范

- 默认使用 TypeScript 和 `<script setup lang="ts">`。
- 优先使用 Nuxt 自动导入和项目别名：根目录使用 `#shared/`，`app` 内使用 `~/shared/`。
- 后端请求体使用 Zod 校验，数据库操作使用 NuxtHub 提供的 Drizzle ORM。
- 用户可见的审核结果通过 `userNotifications` 站内信写入。
- 每次修改后运行：

```bash
pnpm nuxt typecheck
```

涉及数据库 schema 或迁移时，还需要运行：

```bash
pnpm nuxt db generate
```
