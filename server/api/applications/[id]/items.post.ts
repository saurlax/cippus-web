import { and, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";
import {
  listEligibleAchievements,
  recalculateApplicationById,
} from "~~/server/utils/application-scoring";

const bodySchema = z.object({
  achievementType: z.enum(["award", "paper", "patent", "innovation"]),
  achievementId: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const applicationId = Number(getRouterParam(event, "id"));

  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    throw createError({ statusCode: 400, statusMessage: "申请 ID 非法" });
  }

  const application = await db.query.applications.findFirst({
    where: eq(schema.applications.id, applicationId),
    with: {
      user: true,
      activity: true,
      items: true,
    },
  });

  if (!application) {
    throw createError({ statusCode: 404, statusMessage: "申请不存在" });
  }

  const isAdmin = !!session.user.admin;
  const isOwner = session.user.username === application.user.username;
  if (!isAdmin && !isOwner) {
    throw createError({ statusCode: 403, statusMessage: "无权限操作该申请" });
  }

  const body = bodySchema.parse(await readBody(event));

  const existing = application.items.find(
    (item) =>
      item.achievementType === body.achievementType &&
      item.achievementId === body.achievementId,
  );
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "该条目已添加" });
  }

  const eligible = await listEligibleAchievements(
    application.activityId,
    application.user.username,
  );

  let allowed = false;
  if (body.achievementType === "award") {
    allowed = eligible.awards.some((item) => item.id === body.achievementId);
  } else if (body.achievementType === "paper") {
    allowed = eligible.papers.some((item) => item.id === body.achievementId);
  } else if (body.achievementType === "patent") {
    allowed = eligible.patents.some((item) => item.id === body.achievementId);
  } else {
    allowed = eligible.innovations.some((item) => item.id === body.achievementId);
  }

  if (!allowed) {
    throw createError({
      statusCode: 400,
      statusMessage: "仅可添加活动时间范围内且已通过审核的成就",
    });
  }

  await db.insert(schema.applicationItems).values({
    applicationId,
    achievementType: body.achievementType,
    achievementId: body.achievementId,
    baseScore: 0,
    multiplier: "1",
    extraScore: 0,
    finalScore: 0,
  });

  return await recalculateApplicationById(applicationId);
});
