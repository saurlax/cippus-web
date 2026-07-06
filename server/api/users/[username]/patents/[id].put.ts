import { and, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: z.enum(patentTypeValues).optional(),
  date: z.coerce.date().optional(),
  members: z.array(z.string().trim().min(1)).optional(),
  evidences: z.array(z.string().min(1)).optional(),
  certificateDate: z.coerce.date().optional(),
  status: z.enum(["draft", "pending"]).optional(),
});

const supplementKeys = new Set(["evidences", "certificateDate"]);

function normalizeMembers(members: string[] | undefined) {
  return Array.from(
    new Set((members || []).map((item) => item.trim()).filter((item) => item.length > 0)),
  );
}

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")!;
  const id = Number(getRouterParam(event, "id"));
  const session = await requireUserSession(event);
  if (session.user?.username !== username)
    throw createError({ statusCode: 403 });

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });
  const body = updateSchema.parse(await readBody(event));
  const current = await db.query.patents.findFirst({
    where: and(eq(schema.patents.id, id), eq(schema.patents.userId, user!.id)),
  });

  if (!current) {
    throw createError({ statusCode: 404, statusMessage: "专利记录不存在" });
  }

  if (current.status === "approved") {
    const hasCoreUpdate = Object.keys(body).some((key) => !supplementKeys.has(key));
    if (hasCoreUpdate) {
      throw createError({ statusCode: 400, statusMessage: "已通过审核的成就只能补充证书日期和佐证材料" });
    }

    const [patent] = await db
      .update(schema.patents)
      .set({
        ...(body.certificateDate ? { certificateDate: body.certificateDate } : {}),
        ...(body.evidences ? { evidences: Array.from(new Set([...current.evidences, ...body.evidences])) } : {}),
      })
      .where(and(eq(schema.patents.id, id), eq(schema.patents.userId, user!.id)))
      .returning();
    return patent;
  }

  const updateBody = {
    ...body,
    ...(body.members ? { members: normalizeMembers(body.members) } : {}),
  };
  const [patent] = await db
    .update(schema.patents)
    .set(updateBody)
    .where(and(eq(schema.patents.id, id), eq(schema.patents.userId, user!.id)))
    .returning();
  return patent;
});
