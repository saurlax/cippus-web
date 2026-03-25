import { and, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  contestId: z.coerce.number().int().positive().optional(),
  level: z.enum(awardLevelValues).optional(),
  type: z.enum(awardTypeValues).optional(),
  date: z.coerce.date().optional(),
  members: z.array(z.string().trim().min(1)).optional(),
  evidences: z.array(z.string().min(1)).optional(),
  status: z.enum(["draft", "pending"]).optional(),
});

function normalizeMembers(members: string[] | undefined) {
  return Array.from(
    new Set((members || []).map((item) => item.trim()).filter((item) => item.length > 0)),
  );
}

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
  const updateBody = {
    ...body,
    ...(body.members ? { members: normalizeMembers(body.members) } : {}),
  };
  const [updated] = await db
    .update(schema.awards)
    .set(updateBody)
    .where(and(eq(schema.awards.id, id), eq(schema.awards.userId, user!.id)))
    .returning();
  return updated;
});