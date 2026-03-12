import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { z } from "zod";

const awardTypesTable = pgTable("award_types", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = updateSchema.parse(await readBody(event));

  const [awardType] = await db
    .update(awardTypesTable)
    .set({ name: body.name })
    .where(eq(awardTypesTable.id, id))
    .returning();

  return awardType;
});
