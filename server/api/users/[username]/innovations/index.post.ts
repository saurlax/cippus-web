import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";
import { assertInnovationSourceAvailable } from "~~/server/utils/innovation-sources";

const createSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(innovationTypeValues),
  sourceType: z.enum(innovationAchievementTypeValues),
  sourceId: z.coerce.number().int().positive(),
  date: z.coerce.date(),
  certificateDate: z.coerce.date().nullable().optional(),
  members: z.array(z.string().trim().min(1)).optional(),
  evidences: z.array(z.string().min(1)).optional(),
  status: z.enum(["draft", "pending"]).optional(),
});

function normalizeMembers(members: string[] | undefined, fallbackUsername: string) {
  const next = Array.from(
    new Set((members || []).map((item) => item.trim()).filter((item) => item.length > 0)),
  );
  return next.length ? next : [fallbackUsername];
}

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")!;
  const session = await requireUserSession(event);
  if (session.user?.username !== username)
    throw createError({ statusCode: 403 });

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });
  const body = createSchema.parse(await readBody(event));
  await assertInnovationSourceAvailable({
    username,
    sourceType: body.sourceType,
    sourceId: body.sourceId,
  });
  const members = normalizeMembers(body.members, username);
  const [record] = await db
    .insert(schema.innovations)
    .values([
      {
        userId: user!.id,
        ...body,
        members,
        evidences: body.evidences || [],
        status: body.status || "draft",
      },
    ])
    .returning();
  return record;
});
