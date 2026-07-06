import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

async function attachReviewNotifications(userId: number, awards: any[]) {
  const ids = awards.map((item) => item.id);
  if (!ids.length) {
    return awards;
  }

  const notifications = await db.query.userNotifications.findMany({
    where: and(
      eq(schema.userNotifications.userId, userId),
      eq(schema.userNotifications.resourceType, "award"),
      inArray(schema.userNotifications.resourceId, ids),
    ),
    orderBy: desc(schema.userNotifications.createdAt),
  });
  const notificationsByResource = Map.groupBy(
    notifications,
    (item) => item.resourceId,
  );

  return awards.map((item) => ({
    ...item,
    reviewNotifications: notificationsByResource.get(item.id) || [],
  }));
}

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");
  if (!username) {
    throw createError({ statusCode: 400, statusMessage: "Missing username" });
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true, username: true, displayAchievements: true },
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const session = await getUserSession(event);
  const canViewAll = session.user?.username === username;
  const displayIds = (user.displayAchievements?.award || []).filter(Number.isInteger);

  if (!canViewAll && !displayIds.length) {
    return [];
  }

  const awards = await db.query.awards.findMany({
    where: canViewAll
      ? sql`"awards"."members" @> ARRAY[${username}]::text[]`
      : and(
          sql`"awards"."members" @> ARRAY[${username}]::text[]`,
          eq(schema.awards.status, "approved"),
          inArray(schema.awards.id, displayIds),
        ),
    orderBy: schema.awards.updatedAt,
    with: {
      contest: true,
    },
  });

  return await attachReviewNotifications(user.id, awards);
});
