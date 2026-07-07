import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const body = createSchema.parse(await readBody(event));

  const [contest] = await db
    .insert(schema.contests)
    .values({
      title: body.title,
      description: body.description,
    })
    .returning();

  if (!contest) {
    throw createError({ statusCode: 500, statusMessage: "比赛创建失败" });
  }

  return contest;
});
