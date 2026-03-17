import { and, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: z.enum(innovationTypeValues).optional(),
  date: z.coerce.date().optional(),
  evidences: z.array(z.string().min(1)).optional(),
  status: z.enum(["draft", "pending"]).optional(),
});

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")!;
  const id = Number(getRouterParam(event, "id"));
  const session = await requireUserSession(event);
  if (session.user?.username !== username)
    throw createError({ statusCode: 403 });

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });
  const body = updateSchema.parse(await readBody(event));
  const [updated] = await db
    .update(schema.innovations)
    .set(body)
    .where(and(eq(schema.innovations.id, id), eq(schema.innovations.userId, user!.id)))
    .returning();
  return updated;
});
