import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const scoringConfigValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
]);

const scoringConfigSchema = z.record(z.string(), scoringConfigValueSchema);

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  scoringConfig: scoringConfigSchema.optional(),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = updateSchema.parse(await readBody(event));

  const [activity] = await db
    .update(schema.activities)
    .set({
      name: body.name,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      scoringConfig: body.scoringConfig,
    })
    .where(eq(schema.activities.id, id))
    .returning();

  return activity;
});
