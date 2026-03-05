import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const [activity] = await db
    .insert(schema.activities)
    .values({
      name: body.name,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    })
    .returning();

  return activity;
});
