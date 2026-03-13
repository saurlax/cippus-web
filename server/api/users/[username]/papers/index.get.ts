import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")!;
  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { id: true },
  });
  return db.query.papers.findMany({
    where: eq(schema.papers.userId, user!.id),
    orderBy: schema.papers.updatedAt,
  });
});
