import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")!;
  const session = await getUserSession(event);
  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { username: true },
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const canViewAll = session.user?.username === username;

  return db.query.papers.findMany({
    where: canViewAll
      ? sql`"papers"."members" @> ARRAY[${username}]::text[]`
      : and(
          sql`"papers"."members" @> ARRAY[${username}]::text[]`,
          eq(schema.papers.status, "approved"),
        ),
    orderBy: schema.papers.updatedAt,
  });
});
