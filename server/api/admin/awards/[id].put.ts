import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { z } from "zod";

const awardTypesTable = pgTable("award_types", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

const updateSchema = z.object({
  status: z.enum(["draft", "pending", "approved", "rejected"]).optional(),
  awardTypeId: z.coerce.number().int().positive().optional(),
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

  if (body.awardTypeId) {
    const [awardType] = await db
      .select({ id: awardTypesTable.id })
      .from(awardTypesTable)
      .where(eq(awardTypesTable.id, body.awardTypeId))
      .limit(1);
    if (!awardType) {
      throw createError({ statusCode: 400, statusMessage: "Invalid award type" });
    }
  }

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
