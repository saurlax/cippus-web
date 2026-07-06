import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  effectiveTotalScore: z.coerce.number().int().min(0),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = updateSchema.parse(await readBody(event));

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "申请 ID 非法" });
  }

  const [application] = await db
    .update(schema.applications)
    .set({
      effectiveTotalScore: body.effectiveTotalScore,
      effectiveScoreManual: true,
    })
    .where(eq(schema.applications.id, id))
    .returning();

  if (!application) {
    throw createError({ statusCode: 404, statusMessage: "申请不存在" });
  }

  return application;
});