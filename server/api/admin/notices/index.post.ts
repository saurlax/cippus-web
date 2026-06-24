import { db, schema } from "@nuxthub/db";
import { sendNoticePublishedEmail } from "~~/server/utils/review-email";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const [notice] = await db
    .insert(schema.notices)
    .values({
      title: body.title,
      content: body.content,
      category: body.category,
    })
    .returning();

  if (!notice) {
    throw createError({ statusCode: 500, statusMessage: "通知创建失败" });
  }

  const users = await db.query.users.findMany({
    columns: {
      email: true,
    },
  });

  await sendNoticePublishedEmail({
    title: notice.title,
    category: notice.category,
    recipientEmails: users.map((item) => item.email || ""),
  });

  return notice;
});
