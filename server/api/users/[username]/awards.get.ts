import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");
  if (!username) {
    throw createError({ statusCode: 400, statusMessage: "Missing username" });
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const awards = await db.query.awards.findMany({
    where: eq(schema.awards.userId, user.id),
    orderBy: schema.awards.updatedAt,
    with: {
      awardType: true,
      contest: true,
    },
  });

  return awards;
});
