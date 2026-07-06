import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

type UpdateProfileBody = {
  name?: unknown;
  bio?: unknown;
  email?: unknown;
  gender?: unknown;
  college?: unknown;
  password?: unknown;
  displayAchievements?: unknown;
};

const achievementKeys = new Set(["award", "paper", "patent", "innovation"]);

function toNullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function toNullableGender(value: unknown): "male" | "female" | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (v === "male" || v === "female") return v as "male" | "female";
  return null;
}

function normalizeDisplayAchievements(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key, ids]) => achievementKeys.has(key) && Array.isArray(ids))
      .map(([key, ids]) => [
        key,
        Array.from(
          new Set(
            (ids as unknown[])
              .map((id) => Number(id))
              .filter((id) => Number.isInteger(id) && id > 0),
          ),
        ),
      ]),
  );
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const username = user.username;

  const body = await readBody<UpdateProfileBody>(event);
  const nextPassword = typeof body.password === "string" ? body.password.trim() : "";
  const displayAchievements = normalizeDisplayAchievements(body.displayAchievements);
  const updateBody = {
    ...("name" in body ? { name: toNullableText(body.name) } : {}),
    ...("bio" in body ? { bio: toNullableText(body.bio) } : {}),
    ...("email" in body ? { email: toNullableText(body.email) } : {}),
    ...("gender" in body ? { gender: toNullableGender(body.gender) } : {}),
    ...("college" in body ? { college: toNullableText(body.college) } : {}),
    ...(nextPassword ? { password: await hashPassword(nextPassword) } : {}),
    ...(displayAchievements ? { displayAchievements } : {}),
  };

  await db
    .update(schema.users)
    .set(updateBody)
    .where(eq(schema.users.username, username));

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
    displayAchievements: updatedUser.displayAchievements,
  };
});
