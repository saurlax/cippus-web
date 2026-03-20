import { and, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const activityId = Number(getRouterParam(event, "id"));

  if (!Number.isInteger(activityId) || activityId <= 0) {
    throw createError({ statusCode: 400, statusMessage: "活动 ID 非法" });
  }

  const activity = await db.query.activities.findFirst({
    where: eq(schema.activities.id, activityId),
    columns: { id: true },
  });

  if (!activity) {
    throw createError({ statusCode: 404, statusMessage: "活动不存在" });
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, session.user.username),
    columns: { id: true },
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "用户不存在" });
  }

  const existing = await db.query.applications.findFirst({
    where: and(
      eq(schema.applications.activityId, activityId),
      eq(schema.applications.userId, user.id),
    ),
    columns: { id: true },
  });

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "你已经创建过该活动申请" });
  }

  const [application] = await db
    .insert(schema.applications)
    .values({
      activityId,
      userId: user.id,
      status: "draft",
      totalScore: 0,
    })
    .returning();

  return application;
});
