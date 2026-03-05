import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  return await db.query.contests.findFirst({
    where: eq(schema.contests.id, id),
  });
});
