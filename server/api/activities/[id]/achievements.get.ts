import { and, eq } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { listEligibleAchievements } from "~~/server/utils/application-scoring";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const activityId = Number(getRouterParam(event, "id"));

  if (!Number.isInteger(activityId) || activityId <= 0) {
    throw createError({ statusCode: 400, statusMessage: "活动 ID 非法" });
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, session.user.username),
    columns: { id: true },
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "用户不存在" });
  }

  const { activity, awards, papers, patents, innovations } =
    await listEligibleAchievements(activityId, session.user.username);

  const ownApplication = await db.query.applications.findFirst({
    where: and(
      eq(schema.applications.activityId, activityId),
      eq(schema.applications.userId, user.id),
    ),
    with: {
      items: true,
    },
  });

  const selectedKeys = new Set(
    (ownApplication?.items || []).map(
      (item) => `${item.achievementType}:${item.achievementId}`,
    ),
  );

  return {
    activity,
    selectedKeys: Array.from(selectedKeys),
    awards: awards.map((item) => ({
      id: item.id,
      achievementType: "award",
      label: item.contest?.title || `比赛 #${item.contestId}`,
      typeText: `${item.level} + ${item.type}`,
      levelKey: item.level,
      typeKey: item.type,
      date: item.date,
      selected: selectedKeys.has(`award:${item.id}`),
    })),
    papers: papers.map((item) => ({
      id: item.id,
      achievementType: "paper",
      label: item.name,
      typeText: item.type,
      typeKey: item.type,
      date: item.date,
      selected: selectedKeys.has(`paper:${item.id}`),
    })),
    patents: patents.map((item) => ({
      id: item.id,
      achievementType: "patent",
      label: item.name,
      typeText: item.type,
      typeKey: item.type,
      date: item.date,
      selected: selectedKeys.has(`patent:${item.id}`),
    })),
    innovations: innovations.map((item) => ({
      id: item.id,
      achievementType: "innovation",
      label: item.name,
      typeText: item.type,
      typeKey: item.type,
      date: item.date,
      selected: selectedKeys.has(`innovation:${item.id}`),
    })),
  };
});
