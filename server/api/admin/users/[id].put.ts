import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);

  const [user] = await db
    .update(schema.users)
    .set({
      username: body.username,
      password: await hashPassword(body.password),
      name: body.name,
      email: body.email,
      gender: body.gender,
      college: body.college,
      admin: body.admin,
    })
    .where(eq(schema.users.id, id))
    .returning();

  return user;
});
