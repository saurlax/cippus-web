import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async () => {
  return db.query.innovations.findMany({
    with: { user: true },
    orderBy: schema.innovations.updatedAt,
  });
});
