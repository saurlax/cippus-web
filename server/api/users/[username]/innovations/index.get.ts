import { and, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")!;
  const session = await getUserSession(event);
  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const canViewAll = session.user?.username === username;

  return db.query.innovations.findMany({
    where: canViewAll
      ? eq(schema.innovations.userId, user.id)
      : and(
          eq(schema.innovations.userId, user.id),
          eq(schema.innovations.status, "approved"),
        ),
    orderBy: schema.innovations.updatedAt,
  });
});
