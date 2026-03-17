import { db } from "@nuxthub/db";

export default defineEventHandler(async () => {
  return await db.query.users.findMany({
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
