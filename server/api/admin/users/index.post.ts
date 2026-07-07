import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const createSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
  name: z.string().trim().nullable().optional(),
  email: z.string().trim().nullable().optional(),
  gender: z.enum(["male", "female"]).nullable().optional(),
  college: z.string().trim().nullable().optional(),
  admin: z.boolean().default(false),
});

export default defineEventHandler(async (event) => {
  const body = createSchema.parse(await readBody(event));

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

  if (!inserted)
    throw createError({ statusCode: 500, statusMessage: "创建用户失败" });

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
