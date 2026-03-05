import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);

  const [activity] = await db
    .update(schema.activities)
    .set({
      name: body.name,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    })
    .where(eq(schema.activities.id, id))
    .returning();

  return activity;
});
