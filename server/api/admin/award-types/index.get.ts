import { asc } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { integer, pgTable, text } from "drizzle-orm/pg-core";

const awardTypesTable = pgTable("award_types", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

export default defineEventHandler(async () => {
  return await db
    .select()
    .from(awardTypesTable)
    .orderBy(asc(awardTypesTable.id));
});
