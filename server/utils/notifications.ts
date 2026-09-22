import { db, schema } from "@nuxthub/db";

const reviewStatusLabelMap = {
  approved: "通过",
  rejected: "拒绝",
} as const;

export async function createAchievementReviewNotification(input: {
  userId: number;
  resourceType: "award" | "paper" | "patent" | "innovation";
  resourceId: number;
  recordTypeLabel: string;
  recordName: string;
  status: "approved" | "rejected";
  reason?: string | null;
}) {
  const statusLabel = reviewStatusLabelMap[input.status];
  const reasonText = input.status === "rejected" && input.reason?.trim()
    ? `拒绝理由：${input.reason.trim()}`
    : "";

  return await db.insert(schema.userNotifications).values({
    userId: input.userId,
    title: `${input.recordTypeLabel}审核${statusLabel}`,
    content: [
      `您提交的${input.recordTypeLabel}《${input.recordName}》已审核${statusLabel}。`,
      reasonText,
    ]
      .filter(Boolean)
      .join("\n"),
    category: "review",
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    reviewStatus: input.status,
    reason: input.reason?.trim() || null,
  });
}

// 证书补充审核的站内信。category 用 "certificate" 与成果审核通知区分，
// 避免被成果的「拒绝理由」时间线误取。
export async function createCertificateReviewNotification(input: {
  userId: number;
  resourceType: "award" | "paper" | "patent" | "innovation";
  resourceId: number;
  recordTypeLabel: string;
  recordName: string;
  status: "approved" | "rejected";
  reason?: string | null;
}) {
  const statusLabel = reviewStatusLabelMap[input.status];
  const reasonText =
    input.status === "rejected" && input.reason?.trim()
      ? `拒绝理由：${input.reason.trim()}`
      : "";

  return await db.insert(schema.userNotifications).values({
    userId: input.userId,
    title: `证书补充审核${statusLabel}`,
    content: [
      `您为${input.recordTypeLabel}《${input.recordName}》补充的证书材料已审核${statusLabel}。`,
      reasonText,
    ]
      .filter(Boolean)
      .join("\n"),
    category: "certificate",
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    reviewStatus: input.status,
    reason: input.reason?.trim() || null,
  });
}