import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(patentTypeValues),
  date: z.coerce.date(),
  evidences: z.array(z.string().min(1)).optional(),
  status: z.enum(["draft", "pending"]).optional(),
});

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")!;
  const session = await requireUserSession(event);
  if (session.user?.username !== username)
    throw createError({ statusCode: 403 });

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });
  const body = createSchema.parse(await readBody(event));
  const [patent] = await db
    .insert(schema.patents)
    .values([
      {
        userId: user!.id,
        ...body,
        evidences: body.evidences || [],
        status: body.status || "draft",
      },
    ])
    .returning();
  return patent;
});
