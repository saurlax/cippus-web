import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);
  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
  });

  if (!user || !user.password || !(await verifyPassword(user.password, password))) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid username or password",
    });
  }

  await setUserSession(event, {
    user: { username: user.username, name: user.name, admin: user.admin },
  });

  return { username: user.username, name: user.name, admin: user.admin };
});
