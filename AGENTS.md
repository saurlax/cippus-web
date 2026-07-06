本项目使用 Nuxt 4 + Vue 3 + Nuxt UI v4 + NuxtHub。如果有不熟悉的地方，请调用 Context7 来获取相关文档。

- 只有必要时才添加注释；
- 尽量复用 Nuxt UI 的组件，包括使用 slot 来定制组件内容。如无必要不要写 tailwindcss；
- 如果要从根目录导入，请使用类似 `#shared/` 的格式，如果要从 `app` 目录导入，请使用类似 `~/shared/` 的格式，不要使用相对路径；
- 默认使用 TypeScript、`<script setup lang="ts">` 和 Nuxt 自动导入能力；
- 前台页面使用 `app/layouts/default.vue`，后台 `/admin/**` 使用 `app/layouts/admin.vue`；
- 登录态来自 `nuxt-auth-utils`，会话用户包含 `id`、`username`、`name`、`admin`；
- 用户可见的审核结果使用站内信，不再发送邮件。公告只是公开内容，不需要发站内信；
- 每次修改完必须运行 `pnpm nuxt typecheck`；
- 只要涉及数据库 schema 或迁移，必须运行 `pnpm nuxt db generate`；

# 后端

- 后端 API 尽量简洁，不要随便自定义 Type，如无必要不需要做太多验证。请使用 Zod 对请求体进行验证；
- 数据库操作使用 NuxtHub 提供的 Drizzle ORM，数据库 schema 定义在 `server/db/schema.ts` 中；
- 后端直接返回数据库返回结果就行，比如 `return db.select().from(users).where(eq(users.id, userId))`；
- 鉴权请使用 nuxt-auth-utils 的 `await getUserSession(event)` 和 `await requireUserSession(event)`；
- 管理端 API 放在 `server/api/admin/**`，由 `server/middleware/admin.ts` 统一限制管理员访问；
- 用户站内信表是 `userNotifications`，审核状态变化时通过 `server/utils/notifications.ts` 写入站内信；
- 公告表 `notices` 用于公开公告列表和详情，不承担站内信推送职责；
- `shared/types`、`shared/utils`、`server/utils` 等目录内的文件会自动导入到全局，不需要手动导入；
- Toast 报错需要在 description 中添加 `e.data.message || e.message`，以便显示具体错误信息；
