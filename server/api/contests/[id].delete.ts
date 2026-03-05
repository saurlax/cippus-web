import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  const [contest] = await db
    .delete(schema.contests)
    .where(eq(schema.contests.id, id))
    .returning();

  return contest;
});
