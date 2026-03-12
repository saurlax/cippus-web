import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async () => {
  return await db.query.awards.findMany({
    with: {
      contest: true,
      user: true,
    },
    orderBy: schema.awards.updatedAt,
  });
});