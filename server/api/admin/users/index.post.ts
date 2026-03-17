import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const [inserted] = await db
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
    .returning({ id: schema.users.id });

  return await db.query.users.findFirst({
    where: eq(schema.users.id, inserted.id),
    columns: {
      id: true,
      username: true,
      name: true,
      email: true,
      gender: true,
      college: true,
      admin: true,
    },
  });
});
