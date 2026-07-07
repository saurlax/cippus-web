本项目使用 Nuxt 4 + Vue 3 + Nuxt UI v4 + NuxtHub + Drizzle ORM。开发时以服务端权限边界、显式字段返回和项目既有风格为第一优先级。

如果不熟悉 Nuxt、Vue、Nuxt UI、NuxtHub、Drizzle、nuxt-auth-utils、Zod 等库或框架的当前用法，必须使用 Context7 获取最新文档后再改。

## 必做检查

- 每次修改后运行 `pnpm nuxt typecheck`。
- 涉及 `server/db/schema.ts` 或迁移时，运行 `pnpm nuxt db generate`。
- 修改 API 时检查调用方页面，确认请求路径、方法、返回字段和错误提示仍匹配。

## 技术风格

- 默认使用 TypeScript、`<script setup lang="ts">` 和 Nuxt 自动导入。
- 只有必要时才添加注释，注释用于解释业务约束或复杂逻辑，不描述显而易见的代码。
- 尽量复用 Nuxt UI 组件和 slot 定制；无必要不要手写 Tailwind CSS。
- 从根目录导入使用 `#shared/` 等别名；从 `app` 目录导入使用 `~/shared/` 等别名；不要使用深层相对路径。
- `shared/types`、`shared/utils`、`server/utils` 等自动导入目录内的导出通常不需要手动 import。
- Toast 报错的 `description` 必须包含 `e.data.message || e.message`，方便展示服务端具体错误。

## 页面与布局

- 前台页面使用 `app/layouts/default.vue`。
- 后台 `/admin/**` 使用 `app/layouts/admin.vue`。
- 管理后台导航、表格、表单优先保持现有 Nuxt UI Dashboard 风格。

## 鉴权与会话

- 登录态来自 `nuxt-auth-utils`。
- 会话用户只假定包含 `id`、`username`、`name`、`admin`。
- 普通鉴权使用 `await getUserSession(event)` 或 `await requireUserSession(event)`。
- 管理端 API 必须放在 `server/api/admin/**`，由 `server/middleware/admin.ts` 统一限制管理员访问。
- 公开 API 应默认只读。公告、竞赛、活动、用户等管理写操作不要放在公开命名空间。

## API 安全规范

- 服务端不信任前端隐藏字段、禁用控件或 URL 中的身份信息。
- 用户资源写操作必须以当前会话用户为准，并在 SQL 条件中限制资源归属。
- 用户可写字段必须使用 Zod 白名单 schema，禁止把完整 body 直接写入数据库。
- 用户端不得写入审核结论、管理员身份、分数、人工有效分、审核原因、证书时间等后台控制字段，除非业务明确允许。
- API 返回用户信息必须显式声明 columns；不要使用 `user: true` 或返回完整 `users` 行，避免泄漏 `password` 等敏感字段。
- 公开个人页只能返回允许公开展示的数据；审核站内信、拒绝理由等内部信息只能返回给资源本人或明确有权限的管理员。
- 列表接口需要分页或明确的返回范围；管理端列表的 `pageSize` 应有上限。
- 上传接口必须校验登录态、资源归属、文件类型和大小。

## 后端规范

- 后端 API 尽量简洁，不要随便自定义 Type；请求体使用 Zod 验证。
- 数据库操作使用 NuxtHub 提供的 Drizzle ORM，schema 定义在 `server/db/schema.ts`。
- 数据库返回结果可以直接返回，但必须先确认不包含敏感字段或过大范围数据。
- 公告表 `notices` 只用于公开公告列表和详情，不承担站内信推送职责。
- 用户站内信表是 `userNotifications`，审核状态变化时通过 `server/utils/notifications.ts` 写入。
- 用户可见的审核结果使用站内信，不再发送邮件。

## 业务约束

- 成果状态包括 `draft`、`pending`、`approved`、`rejected`。
- 用户只能编辑草稿成果；审核中的成果只能按业务规则回退草稿；已审核或已拒绝成果不能由用户直接修改。
- 审核拒绝必须填写理由，并写入对应用户的站内信。
- 已通过成果被拒绝时，需要从相关活动申报中移除并重新计算分数。
- 大创成果必须关联可用的奖项、论文或专利，且同一来源不能被重复登记。
