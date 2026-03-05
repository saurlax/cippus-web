import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  contestId: z.number().int().positive().optional(),
  level: z.string().optional(),
  type: z.string().optional(),
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
  const { contestId, level, type } = body;

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

  return await db
    .update(schema.awards)
    .set({
      ...(contestId ? { contestId } : {}),
      ...(level ? ({ level: level as any } as any) : {}),
      ...(type ? ({ type: type as any } as any) : {}),
      status: "draft",
    } as any)
    .where(eq(schema.awards.id, awardId))
    .returning();
});
