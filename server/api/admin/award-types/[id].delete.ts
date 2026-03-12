import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { integer, pgTable, text } from "drizzle-orm/pg-core";

const awardTypesTable = pgTable("award_types", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  const [awardType] = await db
    .delete(awardTypesTable)
    .where(eq(awardTypesTable.id, id))
    .returning();

  return awardType;
});
