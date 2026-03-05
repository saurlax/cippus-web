import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);

  const [contest] = await db
    .update(schema.contests)
    .set({
      title: body.title,
      description: body.description,
    })
    .where(eq(schema.contests.id, id))
    .returning();

  return contest;
});
