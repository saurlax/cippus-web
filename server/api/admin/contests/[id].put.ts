import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "比赛 ID 非法" });
  }

  const body = updateSchema.parse(await readBody(event));

  const [contest] = await db
    .update(schema.contests)
    .set(body)
    .where(eq(schema.contests.id, id))
    .returning();

  if (!contest) {
    throw createError({ statusCode: 404, statusMessage: "比赛不存在" });
  }

  return contest;
});
