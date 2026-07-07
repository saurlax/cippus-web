import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const query = adminReviewListQuerySchema.parse(getQuery(event));
  const where =
    query.status === "all" ? undefined : eq(schema.awards.status, query.status);

  const awards = await db.query.awards.findMany({
    with: {
      contest: true,
      user: {
        columns: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
    orderBy: schema.awards.updatedAt,
    where,
    limit: query.search ? undefined : query.pageSize,
    offset: query.search ? undefined : (query.page - 1) * query.pageSize,
  });

  if (!query.search) {
    return {
      items: awards,
      total: await db.$count(schema.awards, where),
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  const filteredAwards = awards.filter((item) =>
    adminMatchesKeyword(
      [
        item.id,
        item.user?.username,
        item.contest?.title,
        item.level,
        adminAwardLevelLabels[item.level],
        item.type,
        adminAwardTypeLabels[item.type],
        adminFormatMembersText(item.members),
        item.status,
        adminReviewStatusLabels[item.status],
      ],
      query.search,
    ),
  );

  return adminPaginateItems(filteredAwards, query.page, query.pageSize);
});
