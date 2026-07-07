import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const scoringConfigValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.array(z.number().finite()),
]);

const scoringConfigSchema = z.record(z.string(), scoringConfigValueSchema);

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  maxAchievementsPerUser: z.coerce.number().int().positive().nullable().optional(),
  scoringConfig: scoringConfigSchema.optional(),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "活动 ID 非法" });
  }

  const body = updateSchema.parse(await readBody(event));

  const [activity] = await db
    .update(schema.activities)
    .set(body)
    .where(eq(schema.activities.id, id))
    .returning();

  if (!activity) {
    throw createError({ statusCode: 404, statusMessage: "活动不存在" });
  }

  return activity;
});
