import { and, desc, eq, isNull } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const notifications = await db
    .select()
    .from(schema.userNotifications)
    .where(eq(schema.userNotifications.userId, user.id))
    .orderBy(desc(schema.userNotifications.createdAt));

  const unreadCount = await db.$count(
    schema.userNotifications,
    and(
      eq(schema.userNotifications.userId, user.id),
      isNull(schema.userNotifications.readAt),
    ),
  );

  return { notifications, unreadCount };
});