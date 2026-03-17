import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  return await db.query.users.findFirst({
    where: eq(schema.users.id, id),
    columns: {
      id: true,
      username: true,
      name: true,
      email: true,
      gender: true,
      college: true,
      admin: true,
    },
  });
});
