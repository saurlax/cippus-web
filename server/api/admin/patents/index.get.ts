import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const query = adminReviewListQuerySchema.parse(getQuery(event));
  const where =
    query.status === "all" ? undefined : eq(schema.patents.status, query.status);

  const patents = await db.query.patents.findMany({
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
    orderBy: schema.patents.updatedAt,
    where,
    limit: query.search ? undefined : query.pageSize,
    offset: query.search ? undefined : (query.page - 1) * query.pageSize,
  });

  if (!query.search) {
    return {
      items: patents,
      total: await db.$count(schema.patents, where),
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  const filteredPatents = patents.filter((item) =>
    adminMatchesKeyword(
      [
        item.id,
        item.user?.username,
        item.name,
        item.type,
        adminPatentTypeLabels[item.type],
        adminFormatMembersText(item.members),
        item.status,
        adminReviewStatusLabels[item.status],
      ],
      query.search,
    ),
  );

  return adminPaginateItems(filteredPatents, query.page, query.pageSize);
});
