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
      eq(schema.userNotifications.resourceType, "paper"),
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

  const papers = await db.query.papers.findMany({
    where: canViewAll
      ? sql`"papers"."members" @> ARRAY[${username}]::text[]`
      : and(
          sql`"papers"."members" @> ARRAY[${username}]::text[]`,
          eq(schema.papers.status, "approved"),
        ),
    orderBy: schema.papers.updatedAt,
  });

  return await attachReviewNotifications(user.id, papers);
});
