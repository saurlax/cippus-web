本项目使用 Nuxt UI + NuxtHub。

- 只有必要时才添加注释；
- 尽量复用 Nuxt UI 的组件，包括使用 slot 来定制组件内容。如无必要不要写 tailwindcss；

# 后端

- 后端 API 尽量简洁，不要随便自定义 Type，如无必要不需要做太多验证。请使用 Zod 对请求体进行验证；
- 数据库操作使用 NuxtHub 提供的 Drizzle ORM，数据库 schema 定义在 `server/db/schema.ts` 中；
- 后端直接返回数据库返回结果就行，比如 `return db.select().from(users).where(eq(users.id, userId))`；
- 鉴权请使用 nuxt-auth-utils 的 `await getUserSession(event)` 和 `await requireUserSession(event)`；
