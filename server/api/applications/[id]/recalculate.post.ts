import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { recalculateApplicationById } from "~~/server/utils/application-scoring";

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

  return await recalculateApplicationById(applicationId);
});
