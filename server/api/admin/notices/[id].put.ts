import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  content: z.string().trim().min(1).optional(),
  category: z.string().trim().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "公告 ID 非法" });
  }

  const body = updateSchema.parse(await readBody(event));

  const [notice] = await db
    .update(schema.notices)
    .set(body)
    .where(eq(schema.notices.id, id))
    .returning();

  if (!notice) {
    throw createError({ statusCode: 404, statusMessage: "公告不存在" });
  }

  return notice;
});
