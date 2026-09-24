import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const { ticket } = getQuery(event);
  const serviceUrl = encodeURIComponent(String(config.casServiceUrl || "").trim());

  if (!ticket) {
    return sendRedirect(
      event,
      `${config.casBaseUrl}/login?service=${serviceUrl}`
    );
  }

  const rawXml = await $fetch<string>(
    `${config.casBaseUrl}/serviceValidate?service=${serviceUrl}&ticket=${ticket}`
  );
  const username = rawXml.match(/<cas:ID_NUMBER>(\d+)<\/cas:ID_NUMBER>/)?.[1];
  const name = rawXml.match(/<cas:USER_NAME>([^<]+)<\/cas:USER_NAME>/)?.[1];

  if (username) {
    let user = await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });

    if (!user) {
      user = (
        await db
          .insert(schema.users)
          .values({
            username,
            name: name ?? null,
            authProvider: "cas",
          })
          .returning()
      )[0];
    } else {
      // 统一认证是姓名的权威来源：接管既有账号时补标记，并让库里的姓名与学校数据保持一致，
      // 避免导航栏（会话姓名）与个人主页（库内姓名）不一致。
      const nextName = name && name !== user.name ? name : undefined;
      if (user.authProvider !== "cas" || nextName) {
        const [updated] = await db
          .update(schema.users)
          .set({
            authProvider: "cas",
            ...(nextName ? { name: nextName } : {}),
          })
          .where(eq(schema.users.id, user.id))
          .returning();
        user = updated || user;
      }
    }

    if (!user) {
      throw createError({ statusCode: 500, statusMessage: "用户创建失败" });
    }

    await setUserSession(event, {
      user: {
        id: user.id,
        username,
        name: user.name,
        avatar: user.avatar ?? null,
        admin: user.admin,
      },
    });
    return sendRedirect(event, "/");
  }

  return sendRedirect(event, "/login");
});
