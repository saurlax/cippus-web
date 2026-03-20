import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const scoringConfigValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
]);

const scoringConfigSchema = z.record(z.string(), scoringConfigValueSchema);

const createSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  scoringConfig: scoringConfigSchema.optional(),
});

export default defineEventHandler(async (event) => {
  const body = createSchema.parse(await readBody(event));

  const [activity] = await db
    .insert(schema.activities)
    .values({
      name: body.name,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      ...(body.scoringConfig ? { scoringConfig: body.scoringConfig } : {}),
    })
    .returning();

  return activity;
});
