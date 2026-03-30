import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(reviewStatusValues).optional(),
  level: z.enum(awardLevelValues).optional(),
  type: z.enum(awardTypeValues).optional(),
  date: z.coerce.date().optional(),
  members: z.array(z.string().trim().min(1)).optional(),
  evidences: z.array(z.string().min(1)).optional(),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = updateSchema.parse(await readBody(event));
  const [updated] = await db
    .update(schema.awards)
    .set(body)
    .where(eq(schema.awards.id, id))
    .returning();
  return updated;
});
