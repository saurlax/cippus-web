import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";
import { createAchievementReviewNotification } from "~~/server/utils/notifications";

const updateSchema = z.object({
  status: z.enum(reviewStatusValues).optional(),
  level: z.enum(awardLevelValues).optional(),
  type: z.enum(awardTypeValues).optional(),
  date: z.coerce.date().optional(),
  members: z.array(z.string().trim().min(1)).optional(),
  evidences: z.array(z.string().min(1)).optional(),
  reviewReason: z.string().trim().optional(),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = updateSchema.parse(await readBody(event));
  const current = await db.query.awards.findFirst({
    where: eq(schema.awards.id, id),
    with: {
      contest: true,
      user: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!current) {
    throw createError({ statusCode: 404, statusMessage: "奖项记录不存在" });
  }

  if (body.status === "rejected" && !body.reviewReason) {
    throw createError({ statusCode: 400, statusMessage: "拒绝审核时必须填写理由" });
  }

  const { reviewReason, ...updateBody } = body;

  const [updated] = await db
    .update(schema.awards)
    .set(updateBody)
    .where(eq(schema.awards.id, id))
    .returning();

  if (
    body.status &&
    body.status !== current.status &&
    (body.status === "approved" || body.status === "rejected")
  ) {
    await createAchievementReviewNotification({
      userId: current.user.id,
      resourceType: "award",
      resourceId: current.id,
      recordTypeLabel: "奖项",
      recordName: current.contest?.title || `奖项 #${current.id}`,
      status: body.status,
      reason: reviewReason,
    });
  }

  return updated;
});
