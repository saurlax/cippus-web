import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");
  if (!username) {
    throw createError({ statusCode: 400, statusMessage: "Missing username" });
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { username: true },
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const session = await getUserSession(event);
  const canViewAll = session.user?.username === username;

  const awards = await db.query.awards.findMany({
    where: canViewAll
      ? sql`"awards"."members" @> ARRAY[${username}]::text[]`
      : and(
          sql`"awards"."members" @> ARRAY[${username}]::text[]`,
          eq(schema.awards.status, "approved"),
        ),
    orderBy: schema.awards.updatedAt,
    with: {
      contest: true,
    },
  });

  return awards;
});
