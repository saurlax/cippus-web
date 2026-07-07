import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "公告 ID 非法" });
  }

  const [notice] = await db
    .delete(schema.notices)
    .where(eq(schema.notices.id, id))
    .returning();

  if (!notice) {
    throw createError({ statusCode: 404, statusMessage: "公告不存在" });
  }

  return notice;
});
