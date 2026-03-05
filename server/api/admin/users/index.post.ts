import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const [user] = await db
    .insert(schema.users)
    .values({
      username: body.username,
      password: await hashPassword(body.password),
      name: body.name,
      email: body.email,
      gender: body.gender,
      college: body.college,
      admin: body.admin,
    })
    .returning();

  return user;
});
