import { eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";

type UpdateProfileBody = {
  name?: unknown;
  bio?: unknown;
  email?: unknown;
  gender?: unknown;
  college?: unknown;
  password?: unknown;
};

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

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");

  if (!username) {
    throw createError({ statusCode: 400, statusMessage: "Missing username" });
  }

  const session = await requireUserSession(event);
  if (session.user?.username !== username) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const body = await readBody<UpdateProfileBody>(event);
  const nextPassword = typeof body.password === "string" ? body.password.trim() : "";

  await db
    .update(schema.users)
    .set({
      name: toNullableText(body.name),
      bio: toNullableText(body.bio),
      email: toNullableText(body.email),
      gender: toNullableGender(body.gender),
      college: toNullableText(body.college),
      ...(nextPassword ? { password: await hashPassword(nextPassword) } : {}),
    })
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
      admin: true,
    },
  });

  if (!updatedUser) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  await setUserSession(event, {
    user: {
      username: updatedUser.username,
      name: updatedUser.name,
      admin: updatedUser.admin,
    },
  });

  return updatedUser;
});
