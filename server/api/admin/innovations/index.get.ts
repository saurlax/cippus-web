import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async () => {
  const innovations = await db.query.innovations.findMany({
    with: { user: true },
    orderBy: schema.innovations.updatedAt,
  });

  return await Promise.all(
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
});
