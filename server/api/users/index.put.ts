import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const displayAchievementsSchema = z
  .record(z.string(), z.array(z.coerce.number().int().positive()))
  .optional();

const updateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().optional(),
  gender: z.enum(["male", "female"]).nullable().optional(),
  college: z.string().optional(),
  avatar: z.string().optional().nullable(),
  password: z.string().optional(),
  displayAchievements: displayAchievementsSchema,
});

const achievementKeys = ["award", "paper", "patent", "innovation"] as const;
type AchievementKey = (typeof achievementKeys)[number];

const achievementTables: Record<AchievementKey, any> = {
  award: schema.awards,
  paper: schema.papers,
  patent: schema.patents,
  innovation: schema.innovations,
};

function toNullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

// 头像只能指向本人通过 /api/blob/upload 上传的文件，避免把别人的附件或任意字符串当作头像
function normalizeAvatarPath(value: unknown, username: string) {
  const normalized = toNullableText(value);

  if (
    normalized &&
    (!normalized.startsWith(`avatar/${username}/`) || normalized.includes(".."))
  ) {
    throw createError({ statusCode: 400, statusMessage: "头像地址非法" });
  }

  return normalized;
}

// 展示设置只允许保存“本人可见且已通过审核”的成果 id，
// 防止删除记录或审核回退后留下失效勾选（前端也会同步过滤）。
async function findDisplayableIds(kind: AchievementKey, username: string) {
  const table = achievementTables[kind];
  const rows: { id: number }[] = await db
    .select({ id: table.id })
    .from(table)
    .where(
      and(
        sql`${table.members} @> ARRAY[${username}]::text[]`,
        eq(table.status, "approved"),
      ),
    );

  return new Set<number>(rows.map((row) => row.id));
}

async function normalizeDisplayAchievements(
  value: z.infer<typeof displayAchievementsSchema>,
  username: string,
) {
  if (!value) {
    return undefined;
  }

  const entries = await Promise.all(
    achievementKeys
      .filter((kind) => Array.isArray(value[kind]))
      .map(async (kind) => {
        const allowedIds = await findDisplayableIds(kind, username);
        const ids = Array.from(new Set(value[kind])).filter((id) =>
          allowedIds.has(id),
        );

        return [kind, ids] as const;
      }),
  );

  return Object.fromEntries(entries);
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const username = user.username;

  const body = updateProfileSchema.parse(await readBody(event));
  const nextPassword = typeof body.password === "string" ? body.password.trim() : "";
  const currentUser = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: { name: true, authProvider: true },
  });

  if (!currentUser) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const nameLocked = currentUser.authProvider === "cas";

  // 统一认证用户的姓名由学校统一身份认证提供，不能自行改写
  if (
    nameLocked &&
    "name" in body &&
    toNullableText(body.name) !== currentUser.name
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "统一认证用户的姓名由学校提供，不能修改",
    });
  }

  const displayAchievements = await normalizeDisplayAchievements(
    body.displayAchievements,
    username,
  );
  const updateBody = {
    ...("name" in body && !nameLocked ? { name: toNullableText(body.name) } : {}),
    ...("bio" in body ? { bio: toNullableText(body.bio) } : {}),
    ...("email" in body ? { email: toNullableText(body.email) } : {}),
    ...("gender" in body ? { gender: body.gender } : {}),
    ...("college" in body ? { college: toNullableText(body.college) } : {}),
    ...("avatar" in body ? { avatar: normalizeAvatarPath(body.avatar, username) } : {}),
    ...(nextPassword ? { password: await hashPassword(nextPassword) } : {}),
    ...(displayAchievements ? { displayAchievements } : {}),
  };

  // 白名单过滤后可能没有可写字段（例如只提交了后台控制字段），此时跳过写库，避免空 set 报错
  if (Object.keys(updateBody).length) {
    await db
      .update(schema.users)
      .set(updateBody)
      .where(eq(schema.users.username, username));
  }

  const updatedUser = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
    columns: {
      id: true,
      username: true,
      name: true,
      bio: true,
      email: true,
      gender: true,
      college: true,
      avatar: true,
      displayAchievements: true,
      admin: true,
    },
  });

  if (!updatedUser) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  await setUserSession(event, {
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      admin: updatedUser.admin,
    },
  });

  return {
    id: updatedUser.id,
    username: updatedUser.username,
    name: updatedUser.name,
    bio: updatedUser.bio,
    email: updatedUser.email,
    gender: updatedUser.gender,
    college: updatedUser.college,
    avatar: updatedUser.avatar,
    displayAchievements: updatedUser.displayAchievements,
  };
});
