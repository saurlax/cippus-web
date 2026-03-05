import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);

  const [notice] = await db
    .update(schema.notices)
    .set({
      title: body.title,
      content: body.content,
      category: body.category,
    })
    .where(eq(schema.notices.id, id))
    .returning();

  return notice;
});
