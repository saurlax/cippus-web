import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  return await db.query.activities.findFirst({
    where: eq(schema.activities.id, id),
  });
});
