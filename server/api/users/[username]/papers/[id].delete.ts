import { and, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")!;
  const id = Number(getRouterParam(event, "id"));
  const session = await requireUserSession(event);
  if (session.user?.username !== username) {
    throw createError({ statusCode: 403 });
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });

  const current = await db.query.papers.findFirst({
    where: and(eq(schema.papers.id, id), eq(schema.papers.userId, user!.id)),
  });

  if (!current) {
    throw createError({ statusCode: 404, statusMessage: "论文记录不存在" });
  }

  if (current.status !== "draft") {
    throw createError({ statusCode: 400, statusMessage: "只能删除草稿状态的成就" });
  }

  const [deleted] = await db
    .delete(schema.papers)
    .where(and(eq(schema.papers.id, id), eq(schema.papers.userId, user!.id)))
    .returning();

  return deleted;
});
