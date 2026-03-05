import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const [notice] = await db
    .insert(schema.notices)
    .values({
      title: body.title,
      content: body.content,
      category: body.category,
    })
    .returning();

  return notice;
});
