import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");

  if (!username) {
    throw createError({ statusCode: 400, statusMessage: "Missing username" });
  }

  return await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: {
      id: true,
      username: true,
      name: true,
      bio: true,
      email: true,
      gender: true,
      college: true,
      admin: true,
    },
  });
});
