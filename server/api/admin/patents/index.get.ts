import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async () => {
  return await db.query.patents.findMany({
    with: {
      user: true,
    },
    orderBy: schema.patents.updatedAt,
  });
});
