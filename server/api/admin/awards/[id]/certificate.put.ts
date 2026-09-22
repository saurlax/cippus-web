import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";
import { createCertificateReviewNotification } from "~~/server/utils/notifications";

const bodySchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reason: z.string().trim().optional(),
});

// 审核用户补充的证书材料。只改 certificateStatus，不动成果本身的 status，
// 因此不会影响计分、公开可见性与活动申报。
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "奖项 ID 非法" });
  }

  const body = bodySchema.parse(await readBody(event));

  if (body.status === "rejected" && !body.reason?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "拒绝补充证书时必须填写理由",
    });
  }

  const current = await db.query.awards.findFirst({
    where: eq(schema.awards.id, id),
    with: {
      user: { columns: { id: true } },
      contest: true,
    },
  });

  if (!current) {
    throw createError({ statusCode: 404, statusMessage: "奖项记录不存在" });
  }

  if (current.certificateStatus !== "pending") {
    throw createError({
      statusCode: 400,
      statusMessage: "该记录没有待审核的证书补充",
    });
  }

  // 审核通过时，把证书佐证并入「佐证材料」，便于统一查看
  const [updated] = await db
    .update(schema.awards)
    .set(
      body.status === "approved"
        ? {
            certificateStatus: body.status,
            evidences: Array.from(
              new Set([
                ...(current.evidences || []),
                ...(current.certificateEvidences || []),
              ]),
            ),
          }
        : { certificateStatus: body.status },
    )
    .where(eq(schema.awards.id, id))
    .returning();

  await createCertificateReviewNotification({
    userId: current.user.id,
    resourceType: "award",
    resourceId: current.id,
    recordTypeLabel: "奖项",
    recordName: current.contest?.title || `奖项 #${current.id}`,
    status: body.status,
    reason: body.reason,
  });

  return updated;
});
