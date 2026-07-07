import { and, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: z.enum(paperTypeValues).optional(),
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
  const current = await db.query.papers.findFirst({
    where: and(eq(schema.papers.id, id), eq(schema.papers.userId, user!.id)),
  });

  if (!current) {
    throw createError({ statusCode: 404, statusMessage: "论文记录不存在" });
  }

  if (current.status === "pending") {
    if (body.status !== "draft" || Object.keys(body).length !== 1) {
      throw createError({ statusCode: 400, statusMessage: "审核中的成就只能回退为草稿" });
    }
    const [paper] = await db
      .update(schema.papers)
      .set({ status: "draft" })
      .where(and(eq(schema.papers.id, id), eq(schema.papers.userId, user!.id)))
      .returning();
    return paper;
  }

  if (current.status !== "draft") {
    throw createError({ statusCode: 400, statusMessage: "已审核或已拒绝的成就不能修改" });
  }

  const updateBody = {
    ...body,
    ...(body.members ? { members: normalizeMembers(body.members) } : {}),
  };
  const [paper] = await db
    .update(schema.papers)
    .set(updateBody)
    .where(and(eq(schema.papers.id, id), eq(schema.papers.userId, user!.id)))
    .returning();
  return paper;
});
