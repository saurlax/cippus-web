import { and, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const bodySchema = z.object({
  certificateDate: z.coerce.date(),
  certificateEvidences: z.array(z.string().min(1)).optional(),
});

// 已审核通过的论文可以补充证书材料：只改证书相关字段，成果本身的 status 保持不变。
export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")!;
  const id = Number(getRouterParam(event, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "论文 ID 非法" });
  }

  const session = await requireUserSession(event);
  if (session.user?.username !== username) {
    throw createError({ statusCode: 403 });
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "用户不存在" });
  }

  const current = await db.query.papers.findFirst({
    where: and(eq(schema.papers.id, id), eq(schema.papers.userId, user.id)),
  });

  if (!current) {
    throw createError({ statusCode: 404, statusMessage: "论文记录不存在" });
  }

  if (current.status !== "approved") {
    throw createError({
      statusCode: 400,
      statusMessage: "只有审核通过的论文才能补充证书",
    });
  }

  if (current.certificateStatus === "pending") {
    throw createError({
      statusCode: 400,
      statusMessage: "证书补充正在审核中，请勿重复提交",
    });
  }

  const body = bodySchema.parse(await readBody(event));

  const [updated] = await db
    .update(schema.papers)
    .set({
      certificateDate: body.certificateDate,
      certificateEvidences: body.certificateEvidences || [],
      certificateStatus: "pending",
    })
    .where(and(eq(schema.papers.id, id), eq(schema.papers.userId, user.id)))
    .returning();

  return updated;
});
