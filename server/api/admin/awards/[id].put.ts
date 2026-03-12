import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["draft", "pending", "approved", "rejected"]).optional(),
  level: z.string().optional(),
  type: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, "id");
  if (!idParam) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }
  const awardId = parseInt(idParam, 10);
  if (isNaN(awardId)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid id" });
  }

  const body = updateSchema.parse(await readBody(event));

  const [updated] = await db
    .update(schema.awards)
    .set(body as any)
    .where(eq(schema.awards.id, awardId))
    .returning();

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  return updated;
});
