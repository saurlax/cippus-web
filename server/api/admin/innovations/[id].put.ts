import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: z.enum(innovationTypeValues).optional(),
  status: z.enum(reviewStatusValues).optional(),
  date: z.coerce.date().optional(),
  evidences: z.array(z.string().min(1)).optional(),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = updateSchema.parse(await readBody(event));
  const [updated] = await db
    .update(schema.innovations)
    .set(body)
    .where(eq(schema.innovations.id, id))
    .returning();
  return updated;
});
