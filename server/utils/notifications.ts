import { db, schema } from "@nuxthub/db";

const reviewStatusLabelMap = {
  approved: "通过",
  rejected: "拒绝",
} as const;

export async function createAchievementReviewNotification(input: {
  userId: number;
  recordTypeLabel: string;
  recordName: string;
  status: "approved" | "rejected";
}) {
  const statusLabel = reviewStatusLabelMap[input.status];

  return await db.insert(schema.userNotifications).values({
    userId: input.userId,
    title: `${input.recordTypeLabel}审核${statusLabel}`,
    content: `您提交的${input.recordTypeLabel}《${input.recordName}》已审核${statusLabel}。`,
    category: "review",
  });
}