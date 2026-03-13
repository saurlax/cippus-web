import { and, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: z.enum(patentTypeValues).optional(),
  date: z.coerce.date().optional(),
});

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")!;
  const id = Number(getRouterParam(event, "id"));
  const session = await requireUserSession(event);
  if (session.user?.username !== username && !session.user?.admin)
    throw createError({ statusCode: 403 });

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });
  const body = updateSchema.parse(await readBody(event));
  const [patent] = await db
    .update(schema.patents)
    .set({ ...body, status: "draft" })
    .where(and(eq(schema.patents.id, id), eq(schema.patents.userId, user!.id)))
    .returning();
  return patent;
});
