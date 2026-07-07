import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const query = adminReviewListQuerySchema.parse(getQuery(event));
  const where =
    query.status === "all"
      ? undefined
      : eq(schema.innovations.status, query.status);

  const innovations = await db.query.innovations.findMany({
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
    orderBy: schema.innovations.updatedAt,
    where,
    limit: query.search ? undefined : query.pageSize,
    offset: query.search ? undefined : (query.page - 1) * query.pageSize,
  });

  const items = await Promise.all(
    innovations.map(async (innovation) => {
      if (!innovation.sourceType || !innovation.sourceId) {
        return {
          ...innovation,
          sourceSummary: "",
        };
      }

      if (innovation.sourceType === "award") {
        const award = await db.query.awards.findFirst({
          where: eq(schema.awards.id, innovation.sourceId),
          with: {
            contest: true,
          },
        });

        return {
          ...innovation,
          sourceSummary: award?.contest?.title || `奖项 #${innovation.sourceId}`,
        };
      }

      if (innovation.sourceType === "paper") {
        const paper = await db.query.papers.findFirst({
          where: eq(schema.papers.id, innovation.sourceId),
        });

        return {
          ...innovation,
          sourceSummary: paper?.name || `论文 #${innovation.sourceId}`,
        };
      }

      const patent = await db.query.patents.findFirst({
        where: eq(schema.patents.id, innovation.sourceId),
      });

      return {
        ...innovation,
        sourceSummary: patent?.name || `专利 #${innovation.sourceId}`,
      };
    }),
  );

  if (!query.search) {
    return {
      items,
      total: await db.$count(schema.innovations, where),
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  const filteredInnovations = items.filter((item) =>
    adminMatchesKeyword(
      [
        item.id,
        item.user?.username,
        item.name,
        item.type,
        adminInnovationTypeLabels[item.type],
        item.sourceSummary,
        adminFormatMembersText(item.members),
        item.status,
        adminReviewStatusLabels[item.status],
      ],
      query.search,
    ),
  );

  return adminPaginateItems(filteredInnovations, query.page, query.pageSize);
});
