import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { z } from "zod";

const awardTypesTable = pgTable("award_types", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

const updateSchema = z.object({
  contestId: z.coerce.number().int().positive().optional(),
  awardTypeId: z.coerce.number().int().positive().optional(),
});

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");
  const idParam = getRouterParam(event, "id");
  if (!username || !idParam) {
    throw createError({ statusCode: 400, statusMessage: "Missing parameters" });
  }
  const awardId = parseInt(idParam, 10);
  if (isNaN(awardId)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid award id" });
  }

  const session = await requireUserSession(event);
  if (session.user?.username !== username && !session.user?.admin) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const rawBody = await readBody(event);
  const body = updateSchema.parse(rawBody);
  const { contestId, awardTypeId } = body;

  // validate contest exists if provided
  if (contestId) {
    const contest = await db.query.contests.findFirst({
      where: eq(schema.contests.id, contestId),
      columns: { id: true },
    });
    if (!contest) {
      throw createError({
        statusCode: 400,
        statusMessage: "Contest not found",
      });
    }
  }

  if (awardTypeId) {
    const [awardType] = await db
      .select({ id: awardTypesTable.id })
      .from(awardTypesTable)
      .where(eq(awardTypesTable.id, awardTypeId))
      .limit(1);
    if (!awardType) {
      throw createError({
        statusCode: 400,
        statusMessage: "Award type not found",
      });
    }
  }

  return await db
    .update(schema.awards)
    .set({
      ...(contestId ? { contestId } : {}),
      ...(awardTypeId ? { awardTypeId } : {}),
      status: "draft",
    } as any)
    .where(eq(schema.awards.id, awardId))
    .returning();
});
