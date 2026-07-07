import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "活动 ID 非法" });
  }

  const [activity] = await db
    .delete(schema.activities)
    .where(eq(schema.activities.id, id))
    .returning();

  if (!activity) {
    throw createError({ statusCode: 404, statusMessage: "活动不存在" });
  }

  return activity;
});
