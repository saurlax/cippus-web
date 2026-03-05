import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  const [notice] = await db
    .delete(schema.notices)
    .where(eq(schema.notices.id, id))
    .returning();

  return notice;
});
