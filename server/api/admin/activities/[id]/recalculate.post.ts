import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { recalculateApplicationById } from "~~/server/utils/application-scoring";

export default defineEventHandler(async (event) => {
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

  const applications = await db.query.applications.findMany({
    where: eq(schema.applications.activityId, activityId),
    columns: { id: true },
  });

  const results = [];
  for (const application of applications) {
    const result = await recalculateApplicationById(application.id);
    results.push(result);
  }

  return {
    mode: "activity",
    updated: results.length,
    results,
  };
});
