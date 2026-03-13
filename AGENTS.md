本项目使用 Nuxt UI + NuxtHub。如果有不熟悉的地方，请调用 Context7 来获取相关文档。

- 只有必要时才添加注释；
- 尽量复用 Nuxt UI 的组件，包括使用 slot 来定制组件内容。如无必要不要写 tailwindcss；
- 如果要从根目录导入，请使用类似 `#shared/` 的格式，如果要从 `app` 目录导入，请使用类似 `~/shared/` 的格式，不要使用相对路径；

# 后端

- 后端 API 尽量简洁，不要随便自定义 Type，如无必要不需要做太多验证。请使用 Zod 对请求体进行验证；
- 数据库操作使用 NuxtHub 提供的 Drizzle ORM，数据库 schema 定义在 `server/db/schema.ts` 中；
- 后端直接返回数据库返回结果就行，比如 `return db.select().from(users).where(eq(users.id, userId))`；
- 鉴权请使用 nuxt-auth-utils 的 `await getUserSession(event)` 和 `await requireUserSession(event)`；
- `shared/types`、`shared/utils`、`server/utils` 等目录内的文件会自动导入到全局，不需要手动导入；
- Toast 报错需要在 description 中添加 `e.data.message || e.message`，以便显示具体错误信息；
