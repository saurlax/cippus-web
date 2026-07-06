import { z } from "zod";

export const adminReviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().default(""),
  status: z.enum(["all", ...reviewStatusValues]).default("all"),
});

export const adminReviewStatusLabels: Record<string, string> = {
  draft: "草稿",
  pending: "待审核",
  approved: "通过",
  rejected: "拒绝",
};

export const adminAwardLevelLabels: Record<string, string> = {
  national: "国家级",
  provincial: "省级",
  municipal: "市级",
  school: "校级",
  college: "学院级",
};

export const adminAwardTypeLabels: Record<string, string> = {
  first_prize: "一等奖",
  second_prize: "二等奖",
  third_prize: "三等奖",
  first_place: "第一名",
  second_place: "第二名",
  third_place: "第三名",
  fourth_place: "第四名",
  fifth_place: "第五名",
  sixth_place: "第六名",
  other: "其他",
  recommended_not_awarded: "推荐但未获奖",
};

export const adminPaperTypeLabels: Record<string, string> = {
  influential: "有较大影响力的",
  other: "其他",
};

export const adminPatentTypeLabels: Record<string, string> = {
  domestic_invention: "国内发明专利",
  international_invention: "国际发明专利",
  utility_model: "实用新型专利",
  design: "外观型专利",
  software_copyright: "软件著作权",
};

export const adminInnovationTypeLabels: Record<string, string> = {
  excellent: "优秀",
  qualified: "合格",
};

export function adminFormatMembersText(members: unknown) {
  if (!Array.isArray(members)) {
    return "";
  }

  return members
    .map((item) => String(item || "").trim())
    .filter((item) => item.length > 0)
    .join(",");
}

export function adminMatchesKeyword(values: unknown[], keyword: string) {
  if (!keyword) {
    return true;
  }

  return values
    .map((value) => String(value || ""))
    .join(" ")
    .toLowerCase()
    .includes(keyword.toLowerCase());
}

export function adminPaginateItems<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}
