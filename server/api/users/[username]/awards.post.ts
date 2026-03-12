import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { z } from "zod";

const awardTypesTable = pgTable("award_types", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

const createSchema = z.object({
  contestId: z.coerce.number().int().positive(),
  awardTypeId: z.coerce.number().int().positive(),
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
  const { contestId, awardTypeId } = body;

  // validate contest exists
  const contest = await db.query.contests.findFirst({
    where: eq(schema.contests.id, contestId),
    columns: { id: true },
  });
  if (!contest) {
    throw createError({ statusCode: 400, statusMessage: "Invalid contest" });
  }

  const [awardType] = await db
    .select({ id: awardTypesTable.id })
    .from(awardTypesTable)
    .where(eq(awardTypesTable.id, awardTypeId))
    .limit(1);
  if (!awardType) {
    throw createError({ statusCode: 400, statusMessage: "Invalid award type" });
  }

  // find user id
  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const [award] = await db
    .insert(schema.awards)
    .values([{
      userId: user.id,
      contestId,
      awardTypeId,
    } as any])
    .returning();

  return award;
});