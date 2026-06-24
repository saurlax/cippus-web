import { and, eq, ne, sql } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import type { InnovationAchievementType } from "#shared/types/db";

export function innovationSourceKey(sourceType: string, sourceId: number) {
  return `${sourceType}:${sourceId}`;
}

export async function assertInnovationSourceAvailable(input: {
  username: string;
  sourceType: InnovationAchievementType;
  sourceId: number;
  excludeInnovationId?: number;
}) {
  const duplicateWhere = [
    eq(schema.innovations.sourceType, input.sourceType),
    eq(schema.innovations.sourceId, input.sourceId),
    ne(schema.innovations.status, "rejected"),
  ];

  if (input.excludeInnovationId) {
    duplicateWhere.push(ne(schema.innovations.id, input.excludeInnovationId));
  }

  const duplicate = await db.query.innovations.findFirst({
    where: and(...duplicateWhere),
    columns: { id: true },
  });

  if (duplicate) {
    throw createError({
      statusCode: 409,
      statusMessage: "该成果已被登记为大创成果，不能重复选择",
    });
  }

  if (input.sourceType === "award") {
    const record = await db.query.awards.findFirst({
      where: and(
        eq(schema.awards.id, input.sourceId),
        ne(schema.awards.status, "rejected"),
        sql`"awards"."members" @> ARRAY[${input.username}]::text[]`,
      ),
      with: {
        contest: true,
      },
    });

    if (!record) {
      throw createError({
        statusCode: 400,
        statusMessage: "所选奖项不存在，或当前用户不是该成果成员",
      });
    }

    return record;
  }

  if (input.sourceType === "paper") {
    const record = await db.query.papers.findFirst({
      where: and(
        eq(schema.papers.id, input.sourceId),
        ne(schema.papers.status, "rejected"),
        sql`"papers"."members" @> ARRAY[${input.username}]::text[]`,
      ),
    });

    if (!record) {
      throw createError({
        statusCode: 400,
        statusMessage: "所选论文不存在，或当前用户不是该成果成员",
      });
    }

    return record;
  }

  const record = await db.query.patents.findFirst({
    where: and(
      eq(schema.patents.id, input.sourceId),
      ne(schema.patents.status, "rejected"),
      sql`"patents"."members" @> ARRAY[${input.username}]::text[]`,
    ),
  });

  if (!record) {
    throw createError({
      statusCode: 400,
      statusMessage: "所选专利不存在，或当前用户不是该成果成员",
    });
  }

  return record;
}
