import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const createSchema = z.object({
  contestId: z.coerce.number().int().positive(),
  level: z.enum(awardLevelValues),
  type: z.enum(awardTypeValues),
  date: z.coerce.date(),
});

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")!;
  const session = await requireUserSession(event);
  if (session.user?.username !== username && !session.user?.admin)
    throw createError({ statusCode: 403 });

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });
  const body = createSchema.parse(await readBody(event));
  const [award] = await db
    .insert(schema.awards)
    .values([{ userId: user!.id, ...body }])
    .returning();
  return award;
});