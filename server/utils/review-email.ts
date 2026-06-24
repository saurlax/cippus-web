import { sendEmail } from "~~/server/utils/mailer";

const reviewStatusLabelMap = {
  approved: "通过",
  rejected: "拒绝",
} as const;

export async function sendAchievementReviewEmail(input: {
  email?: string | null;
  username: string;
  recordTypeLabel: string;
  recordName: string;
  status: "approved" | "rejected";
}) {
  const email = String(input.email || "").trim();
  if (!email) {
    return false;
  }

  const statusLabel = reviewStatusLabelMap[input.status];
  const subject = `${input.recordTypeLabel}审核${statusLabel}`;
  const text = [
    `${input.username}，您好：`,
    "",
    `您提交的${input.recordTypeLabel}《${input.recordName}》已审核${statusLabel}。`,
    "",
    "请登录系统查看详情。",
  ].join("\n");

  return await sendEmail({
    to: email,
    subject,
    text,
    html: `
      <p>${input.username}，您好：</p>
      <p>您提交的${input.recordTypeLabel}《${input.recordName}》已审核${statusLabel}。</p>
      <p>请登录系统查看详情。</p>
    `,
  });
}

export async function sendNoticePublishedEmail(input: {
  title: string;
  category?: string | null;
  recipientEmails: string[];
}) {
  const emails = Array.from(
    new Set(
      input.recipientEmails
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );

  if (!emails.length) {
    return false;
  }

  const categoryText = input.category?.trim()
    ? `分类：${input.category.trim()}`
    : "分类：未设置";

  return await sendEmail({
    to: "undisclosed-recipients:;",
    bcc: emails,
    subject: `新通知：${input.title}`,
    text: [`系统发布了新通知《${input.title}》。`, categoryText, "", "请登录系统查看详情。"].join(
      "\n",
    ),
    html: `
      <p>系统发布了新通知《${input.title}》。</p>
      <p>${categoryText}</p>
      <p>请登录系统查看详情。</p>
    `,
  });
}
