import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const [contest] = await db
    .insert(schema.contests)
    .values({
      title: body.title,
      description: body.description,
    })
    .returning();

  return contest;
});
