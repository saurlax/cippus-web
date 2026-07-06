import { and, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const id = Number(getRouterParam(event, "id"));

  const [notification] = await db
    .update(schema.userNotifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(schema.userNotifications.id, id),
        eq(schema.userNotifications.userId, user.id),
      ),
    )
    .returning();

  if (!notification) {
    throw createError({ statusCode: 404, statusMessage: "站内信不存在" });
  }

  return notification;
});