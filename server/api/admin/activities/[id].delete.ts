import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  const [activity] = await db
    .delete(schema.activities)
    .where(eq(schema.activities.id, id))
    .returning();

  return activity;
});
