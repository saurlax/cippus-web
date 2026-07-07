import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const { username, password } = loginSchema.parse(await readBody(event));
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
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      admin: user.admin,
    },
  });

  return { id: user.id, username: user.username, name: user.name, admin: user.admin };
});
