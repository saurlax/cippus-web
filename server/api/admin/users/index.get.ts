import { asc } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async () => {
  return await db
    .select()
    .from(schema.users)
    .orderBy(asc(schema.users.id));
});
