import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  category: z.string().trim().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const body = createSchema.parse(await readBody(event));

  const [notice] = await db
    .insert(schema.notices)
    .values({
      title: body.title,
      content: body.content,
      category: body.category,
    })
    .returning();

  if (!notice) {
    throw createError({ statusCode: 500, statusMessage: "通知创建失败" });
  }

  return notice;
});
