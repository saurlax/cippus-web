import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const nextPassword = typeof body.password === "string" ? body.password.trim() : "";

  const [updated] = await db
    .update(schema.users)
    .set({
      username: body.username,
      ...(nextPassword ? { password: await hashPassword(nextPassword) } : {}),
      name: body.name,
      email: body.email,
      gender: body.gender,
      college: body.college,
      admin: body.admin,
    })
    .where(eq(schema.users.id, id))
    .returning({ id: schema.users.id });

  return await db.query.users.findFirst({
    where: eq(schema.users.id, updated.id),
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
