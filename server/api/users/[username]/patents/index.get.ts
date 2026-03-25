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

  return db.query.patents.findMany({
    where: canViewAll
      ? sql`"patents"."members" @> ARRAY[${username}]::text[]`
      : and(
          sql`"patents"."members" @> ARRAY[${username}]::text[]`,
          eq(schema.patents.status, "approved"),
        ),
    orderBy: schema.patents.updatedAt,
  });
});
