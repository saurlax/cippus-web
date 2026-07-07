import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "比赛 ID 非法" });
  }

  const [contest] = await db
    .delete(schema.contests)
    .where(eq(schema.contests.id, id))
    .returning();

  if (!contest) {
    throw createError({ statusCode: 404, statusMessage: "比赛不存在" });
  }

  return contest;
});
