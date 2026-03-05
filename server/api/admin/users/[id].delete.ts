import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  const [user] = await db
    .delete(schema.users)
    .where(eq(schema.users.id, id))
    .returning();

  return user;
});
