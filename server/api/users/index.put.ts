import { eq } from "drizzle-orm";
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
  password: z.string().optional(),
  displayAchievements: displayAchievementsSchema,
});

const achievementKeys = new Set(["award", "paper", "patent", "innovation"]);

function toNullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeDisplayAchievements(
  value: z.infer<typeof displayAchievementsSchema>,
) {
  if (!value) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => achievementKeys.has(key))
      .map(([key, ids]) => [
        key,
        Array.from(new Set(ids)),
      ]),
  );
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const username = user.username;

  const body = updateProfileSchema.parse(await readBody(event));
  const nextPassword = typeof body.password === "string" ? body.password.trim() : "";
  const displayAchievements = normalizeDisplayAchievements(body.displayAchievements);
  const updateBody = {
    ...("name" in body ? { name: toNullableText(body.name) } : {}),
    ...("bio" in body ? { bio: toNullableText(body.bio) } : {}),
    ...("email" in body ? { email: toNullableText(body.email) } : {}),
    ...("gender" in body ? { gender: body.gender } : {}),
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
