import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  username: z.string().trim().min(1).optional(),
  password: z.string().optional(),
  name: z.string().trim().nullable().optional(),
  email: z.string().trim().nullable().optional(),
  gender: z.enum(["male", "female"]).nullable().optional(),
  college: z.string().trim().nullable().optional(),
  admin: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "用户 ID 非法" });
  }

  const body = updateSchema.parse(await readBody(event));
  const nextPassword = typeof body.password === "string" ? body.password.trim() : "";
  const { password: _password, ...userBody } = body;

  const [updated] = await db
    .update(schema.users)
    .set({
      ...userBody,
      ...(nextPassword ? { password: await hashPassword(nextPassword) } : {}),
    })
    .where(eq(schema.users.id, id))
    .returning({ id: schema.users.id });

  if (!updated)
    throw createError({ statusCode: 404, statusMessage: "用户不存在" });

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
