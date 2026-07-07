import { desc, ilike, or } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

const searchLimit = 50;

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const type = String(query.type || "notices");
  const keyword = String(query.q || "").trim();
  const pattern = `%${keyword}%`;

  if (type === "contests") {
    return await db
      .select({
        id: schema.contests.id,
        title: schema.contests.title,
        description: schema.contests.description,
        createdAt: schema.contests.createdAt,
      })
      .from(schema.contests)
      .where(
        keyword
          ? or(
              ilike(schema.contests.title, pattern),
              ilike(schema.contests.description, pattern),
            )
          : undefined,
      )
      .orderBy(desc(schema.contests.createdAt))
      .limit(searchLimit);
  }

  if (type === "users") {
    if (!keyword) {
      return [];
    }

    return await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        name: schema.users.name,
        bio: schema.users.bio,
        college: schema.users.college,
      })
      .from(schema.users)
      .where(
        keyword
          ? or(
              ilike(schema.users.username, pattern),
              ilike(schema.users.name, pattern),
              ilike(schema.users.college, pattern),
            )
          : undefined,
      )
      .orderBy(schema.users.username)
      .limit(searchLimit);
  }

  return await db
    .select({
      id: schema.notices.id,
      title: schema.notices.title,
      content: schema.notices.content,
      category: schema.notices.category,
      createdAt: schema.notices.createdAt,
    })
    .from(schema.notices)
    .where(
      keyword
        ? or(
            ilike(schema.notices.title, pattern),
            ilike(schema.notices.content, pattern),
            ilike(schema.notices.category, pattern),
          )
        : undefined,
    )
    .orderBy(desc(schema.notices.createdAt))
    .limit(searchLimit);
});
