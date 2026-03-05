import { desc } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async () => {
  return await db
    .select()
    .from(schema.contests)
    .orderBy(desc(schema.contests.createdAt));
});
