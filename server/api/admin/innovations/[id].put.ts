import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";
import type { InnovationAchievementType } from "#shared/types/db";
import { assertInnovationSourceAvailable } from "~~/server/utils/innovation-sources";
import { createAchievementReviewNotification } from "~~/server/utils/notifications";

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: z.enum(innovationTypeValues).optional(),
  status: z.enum(reviewStatusValues).optional(),
  sourceType: z.enum(innovationAchievementTypeValues).optional(),
  sourceId: z.coerce.number().int().positive().optional(),
  date: z.coerce.date().optional(),
  members: z.array(z.string().trim().min(1)).optional(),
  evidences: z.array(z.string().min(1)).optional(),
  reviewReason: z.string().trim().optional(),
});

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = updateSchema.parse(await readBody(event));
  const current = await db.query.innovations.findFirst({
    where: eq(schema.innovations.id, id),
    with: {
      user: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!current) {
    throw createError({ statusCode: 404, statusMessage: "大创记录不存在" });
  }

  if (body.status === "rejected" && !body.reviewReason) {
    throw createError({ statusCode: 400, statusMessage: "拒绝审核时必须填写理由" });
  }

  const nextSourceType =
    body.sourceType ||
    (current.sourceType as InnovationAchievementType | null);
  const nextSourceId = body.sourceId || current.sourceId;

  if (nextSourceType && nextSourceId) {
    await assertInnovationSourceAvailable({
      username: current.user.username,
      sourceType: nextSourceType,
      sourceId: nextSourceId,
      excludeInnovationId: id,
    });
  }

  const { reviewReason, ...updateBody } = body;

  const [updated] = await db
    .update(schema.innovations)
    .set(updateBody)
    .where(eq(schema.innovations.id, id))
    .returning();

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "大创记录不存在" });
  }

  if (
    body.status &&
    body.status !== current.status &&
    (body.status === "approved" || body.status === "rejected")
  ) {
    await createAchievementReviewNotification({
      userId: current.user.id,
      resourceType: "innovation",
      resourceId: current.id,
      recordTypeLabel: "大创",
      recordName: updated.name,
      status: body.status,
      reason: reviewReason,
    });
  }

  return updated;
});
