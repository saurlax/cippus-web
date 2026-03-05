import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["draft", "pending", "approved", "rejected"]).optional(),
  level: z
    .enum(["national", "provincial", "university", "college"])
    .optional(),
  type: z
    .enum([
      "team_first_prize",
      "team_second_prize",
      "team_third_prize",
      "individual_1st",
      "individual_2nd",
      "individual_3rd",
      "individual_4th",
      "individual_5th",
      "individual_6th",
    ])
    .optional(),
});

type UpdateBody = z.infer<typeof updateSchema>;

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, "id");
  if (!idParam) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }
  const awardId = parseInt(idParam, 10);
  if (isNaN(awardId)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid id" });
  }

  const body = updateSchema.parse(await readBody(event));

  const [updated] = await db
    .update(schema.awards)
    .set(body as any)
    .where(eq(schema.awards.id, awardId))
    .returning();

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  return updated;
});