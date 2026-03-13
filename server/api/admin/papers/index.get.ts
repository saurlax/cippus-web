import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async () => {
  return await db.query.papers.findMany({
    with: {
      user: true,
    },
    orderBy: schema.papers.updatedAt,
  });
});
