import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const query = adminReviewListQuerySchema.parse(getQuery(event));
  const where =
    query.status === "all" ? undefined : eq(schema.papers.status, query.status);

  const papers = await db.query.papers.findMany({
    with: {
      user: true,
    },
    orderBy: schema.papers.updatedAt,
    where,
    limit: query.search ? undefined : query.pageSize,
    offset: query.search ? undefined : (query.page - 1) * query.pageSize,
  });

  if (!query.search) {
    return {
      items: papers,
      total: await db.$count(schema.papers, where),
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  const filteredPapers = papers.filter((item) =>
    adminMatchesKeyword(
      [
        item.id,
        item.user?.username,
        item.name,
        item.type,
        adminPaperTypeLabels[item.type],
        adminFormatMembersText(item.members),
        item.status,
        adminReviewStatusLabels[item.status],
      ],
      query.search,
    ),
  );

  return adminPaginateItems(filteredPapers, query.page, query.pageSize);
});
