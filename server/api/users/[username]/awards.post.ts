import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const createSchema = z.object({
  contestId: z.coerce.number().int().positive(),
  level: z.enum(awardLevelValues),
  type: z.enum(awardTypeValues),
});

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");
  if (!username) {
    throw createError({ statusCode: 400, statusMessage: "Missing username" });
  }

  const session = await requireUserSession(event);
  if (session.user?.username !== username && !session.user?.admin) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const body = createSchema.parse(await readBody(event));
  const { contestId, level, type } = body;

  const contest = await db.query.contests.findFirst({
    where: eq(schema.contests.id, contestId),
    columns: { id: true },
  });
  if (!contest) {
    throw createError({ statusCode: 400, statusMessage: "Invalid contest" });
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const [award] = await db
    .insert(schema.awards)
    .values([{ userId: user.id, contestId, level, type }])
    .returning();

  return award;
});