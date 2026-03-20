import { desc, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { buildApplicationItemsView } from "~~/server/utils/application-scoring";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const activityId = Number(getRouterParam(event, "id"));

  if (!Number.isInteger(activityId) || activityId <= 0) {
    throw createError({ statusCode: 400, statusMessage: "活动 ID 非法" });
  }

  const activity = await db.query.activities.findFirst({
    where: eq(schema.activities.id, activityId),
  });

  if (!activity) {
    throw createError({ statusCode: 404, statusMessage: "活动不存在" });
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(schema.users.username, session.user.username),
    columns: { id: true },
  });

  if (!currentUser) {
    throw createError({ statusCode: 404, statusMessage: "用户不存在" });
  }

  const applications = await db.query.applications.findMany({
    where: eq(schema.applications.activityId, activityId),
    with: {
      user: true,
      items: true,
    },
    orderBy: desc(schema.applications.totalScore),
  });

  const sortedApplications = [...applications].sort((a, b) => {
    const aSelf = a.userId === currentUser.id;
    const bSelf = b.userId === currentUser.id;

    if (aSelf && !bSelf) return -1;
    if (!aSelf && bSelf) return 1;
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.id - b.id;
  });

  const rows = await Promise.all(
    sortedApplications.map(async (application, index) => ({
      id: application.id,
      rank: index + 1,
      isCurrentUser: application.userId === currentUser.id,
      userId: application.userId,
      user: application.user,
      totalScore: application.totalScore,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      itemCount: application.items.length,
      items: await buildApplicationItemsView(application.items),
    })),
  );

  return {
    activity,
    currentUserId: currentUser.id,
    applications: rows,
  };
});
