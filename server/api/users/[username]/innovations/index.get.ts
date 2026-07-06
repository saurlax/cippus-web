import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

async function attachReviewNotifications(userId: number, records: any[]) {
  const ids = records.map((item) => item.id);
  if (!ids.length) {
    return records;
  }

  const notifications = await db.query.userNotifications.findMany({
    where: and(
      eq(schema.userNotifications.userId, userId),
      eq(schema.userNotifications.resourceType, "innovation"),
      inArray(schema.userNotifications.resourceId, ids),
    ),
    orderBy: desc(schema.userNotifications.createdAt),
  });
  const notificationsByResource = Map.groupBy(
    notifications,
    (item) => item.resourceId,
  );

  return records.map((item) => ({
    ...item,
    reviewNotifications: notificationsByResource.get(item.id) || [],
  }));
}

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")!;
  const session = await getUserSession(event);
  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true, username: true },
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const canViewAll = session.user?.username === username;

  const innovations = await db.query.innovations.findMany({
    where: canViewAll
      ? sql`"innovations"."members" @> ARRAY[${username}]::text[]`
      : and(
          sql`"innovations"."members" @> ARRAY[${username}]::text[]`,
          eq(schema.innovations.status, "approved"),
        ),
    orderBy: schema.innovations.updatedAt,
  });

  return await attachReviewNotifications(user.id, innovations);
});
