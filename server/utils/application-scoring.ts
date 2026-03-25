import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db, schema } from "@nuxthub/db";
import { activityDefaultScoringConfig } from "#shared/types/db";

type ScoringValue = string | number | boolean | number[];
type ScoringConfig = Record<string, ScoringValue>;
type AchievementTypeValue = "award" | "paper" | "patent" | "innovation";

function readDefaultRankingFromShared(key: keyof typeof activityDefaultScoringConfig) {
  const value = activityDefaultScoringConfig[key];
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}

const defaultRankingConfig: Record<AchievementTypeValue, number[]> = {
  award: readDefaultRankingFromShared("ranking.award"),
  paper: readDefaultRankingFromShared("ranking.paper"),
  patent: readDefaultRankingFromShared("ranking.patent"),
  innovation: readDefaultRankingFromShared("ranking.innovation"),
};

type AchievementMaps = {
  award: Map<number, Awaited<ReturnType<typeof getAwards>>[number]>;
  paper: Map<number, Awaited<ReturnType<typeof getPapers>>[number]>;
  patent: Map<number, Awaited<ReturnType<typeof getPatents>>[number]>;
  innovation: Map<number, Awaited<ReturnType<typeof getInnovations>>[number]>;
};

function readNumber(value: ScoringValue | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function roundFinalScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value);
}

function readNumberArray(value: ScoringValue | undefined, fallback: number[]): number[] {
  if (Array.isArray(value)) {
    const parsed = value
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item));

    if (parsed.length) {
      return parsed;
    }
  }

  return fallback;
}

function getMemberCoefficient(
  achievementType: AchievementTypeValue,
  achievement: any,
  applicantUsername: string,
  scoringConfig: ScoringConfig,
): number {
  const coefficients = readNumberArray(
    scoringConfig[`ranking.${achievementType}`],
    defaultRankingConfig[achievementType],
  );

  const members = Array.isArray(achievement?.members)
    ? achievement.members
        .map((item: unknown) => String(item || "").trim())
        .filter((item: string) => item.length > 0)
    : [];

  const memberIndex = members.indexOf(applicantUsername);
  if (memberIndex < 0) {
    return 1;
  }

  if (memberIndex >= coefficients.length) {
    return coefficients[coefficients.length - 1] || 1;
  }

  return coefficients[memberIndex] || 1;
}

async function getAwards(ids: number[]) {
  if (!ids.length) {
    return [] as const;
  }

  return await db.query.awards.findMany({
    where: inArray(schema.awards.id, ids),
    with: {
      contest: true,
    },
  });
}

async function getPapers(ids: number[]) {
  if (!ids.length) {
    return [] as const;
  }

  return await db.query.papers.findMany({
    where: inArray(schema.papers.id, ids),
  });
}

async function getPatents(ids: number[]) {
  if (!ids.length) {
    return [] as const;
  }

  return await db.query.patents.findMany({
    where: inArray(schema.patents.id, ids),
  });
}

async function getInnovations(ids: number[]) {
  if (!ids.length) {
    return [] as const;
  }

  return await db.query.innovations.findMany({
    where: inArray(schema.innovations.id, ids),
  });
}

async function loadAchievementMaps(items: { achievementType: AchievementTypeValue; achievementId: number }[]): Promise<AchievementMaps> {
  const awardIds = items
    .filter((item) => item.achievementType === "award")
    .map((item) => item.achievementId);
  const paperIds = items
    .filter((item) => item.achievementType === "paper")
    .map((item) => item.achievementId);
  const patentIds = items
    .filter((item) => item.achievementType === "patent")
    .map((item) => item.achievementId);
  const innovationIds = items
    .filter((item) => item.achievementType === "innovation")
    .map((item) => item.achievementId);

  const [awards, papers, patents, innovations] = await Promise.all([
    getAwards(awardIds),
    getPapers(paperIds),
    getPatents(patentIds),
    getInnovations(innovationIds),
  ]);

  return {
    award: new Map(awards.map((item) => [item.id, item])),
    paper: new Map(papers.map((item) => [item.id, item])),
    patent: new Map(patents.map((item) => [item.id, item])),
    innovation: new Map(innovations.map((item) => [item.id, item])),
  };
}

export type ApplicationItemView = {
  id: number;
  applicationId: number;
  achievementType: AchievementTypeValue;
  achievementId: number;
  baseScore: number;
  multiplier: number;
  extraScore: number;
  finalScore: number;
  displayName: string;
  displayType: string;
  typeKey?: string;
  levelKey?: string;
  achievementDate?: Date | null;
};

function formatFallbackDisplay(type: AchievementTypeValue, id: number) {
  return {
    displayName: `未找到关联数据 #${id}`,
    displayType: type,
  };
}

export function computeScoresForAchievement(
  achievementType: AchievementTypeValue,
  achievement: any,
  scoringConfig: ScoringConfig,
  applicantUsername: string,
) {
  if (!achievement) {
    return {
      baseScore: 0,
      multiplier: 1,
      extraScore: 0,
      finalScore: 0,
    };
  }

  if (achievementType === "award") {
    const level = String(achievement.level || "");
    const type = String(achievement.type || "");
    const contestId = String(achievement.contestId || "");

    const baseScore = readNumber(scoringConfig[`award.${level}.${type}`], 0);
    const multiplier = readNumber(
      scoringConfig[`contest.multiplier.${contestId}.${level}`],
      1,
    );
    const extraScore = readNumber(
      scoringConfig[`contest.extra.${contestId}.${level}`],
      0,
    );
    const memberCoefficient = getMemberCoefficient(
      achievementType,
      achievement,
      applicantUsername,
      scoringConfig,
    );
    const totalMultiplier = multiplier * memberCoefficient;

    return {
      baseScore,
      multiplier: totalMultiplier,
      extraScore,
      finalScore: roundFinalScore((baseScore * multiplier + extraScore) * memberCoefficient),
    };
  }

  if (achievementType === "paper") {
    const type = String(achievement.type || "");
    const baseScore = readNumber(scoringConfig[`paper.${type}`], 0);
    const memberCoefficient = getMemberCoefficient(
      achievementType,
      achievement,
      applicantUsername,
      scoringConfig,
    );

    return {
      baseScore,
      multiplier: memberCoefficient,
      extraScore: 0,
      finalScore: roundFinalScore(baseScore * memberCoefficient),
    };
  }

  if (achievementType === "patent") {
    const type = String(achievement.type || "");
    const baseScore = readNumber(scoringConfig[`patent.${type}`], 0);
    const memberCoefficient = getMemberCoefficient(
      achievementType,
      achievement,
      applicantUsername,
      scoringConfig,
    );

    return {
      baseScore,
      multiplier: memberCoefficient,
      extraScore: 0,
      finalScore: roundFinalScore(baseScore * memberCoefficient),
    };
  }

  const type = String(achievement.type || "");
  const baseScore = readNumber(scoringConfig[`innovation.${type}`], 0);
  const memberCoefficient = getMemberCoefficient(
    achievementType,
    achievement,
    applicantUsername,
    scoringConfig,
  );

  return {
    baseScore,
    multiplier: memberCoefficient,
    extraScore: 0,
    finalScore: roundFinalScore(baseScore * memberCoefficient),
  };
}

function getDisplayForAchievement(
  achievementType: AchievementTypeValue,
  achievementId: number,
  maps: AchievementMaps,
) {
  if (achievementType === "award") {
    const award = maps.award.get(achievementId);
    if (!award) {
      return formatFallbackDisplay(achievementType, achievementId);
    }

    return {
      displayName: award.contest?.title || `比赛 #${award.contestId}`,
      displayType: `${award.level} + ${award.type}`,
      levelKey: award.level,
      typeKey: award.type,
      achievementDate: award.date,
      achievement: award,
    };
  }

  if (achievementType === "paper") {
    const paper = maps.paper.get(achievementId);
    if (!paper) {
      return formatFallbackDisplay(achievementType, achievementId);
    }

    return {
      displayName: paper.name,
      displayType: paper.type,
      typeKey: paper.type,
      achievementDate: paper.date,
      achievement: paper,
    };
  }

  if (achievementType === "patent") {
    const patent = maps.patent.get(achievementId);
    if (!patent) {
      return formatFallbackDisplay(achievementType, achievementId);
    }

    return {
      displayName: patent.name,
      displayType: patent.type,
      typeKey: patent.type,
      achievementDate: patent.date,
      achievement: patent,
    };
  }

  const innovation = maps.innovation.get(achievementId);
  if (!innovation) {
    return formatFallbackDisplay(achievementType, achievementId);
  }

  return {
    displayName: innovation.name,
    displayType: innovation.type,
    typeKey: innovation.type,
    achievementDate: innovation.date,
    achievement: innovation,
  };
}

export async function buildApplicationItemsView(
  items: (typeof schema.applicationItems.$inferSelect)[],
): Promise<ApplicationItemView[]> {
  const maps = await loadAchievementMaps(items);

  return items.map((item) => {
    const display = getDisplayForAchievement(
      item.achievementType,
      item.achievementId,
      maps,
    );

    return {
      id: item.id,
      applicationId: item.applicationId,
      achievementType: item.achievementType,
      achievementId: item.achievementId,
      baseScore: item.baseScore,
      multiplier: Number(item.multiplier),
      extraScore: item.extraScore,
      finalScore: item.finalScore,
      displayName: display.displayName,
      displayType: display.displayType,
      typeKey: (display as any).typeKey,
      levelKey: (display as any).levelKey,
      achievementDate: (display as any).achievementDate || null,
    };
  });
}

export async function recalculateApplicationById(applicationId: number) {
  const application = await db.query.applications.findFirst({
    where: eq(schema.applications.id, applicationId),
    with: {
      user: true,
      activity: true,
      items: true,
    },
  });

  if (!application) {
    throw createError({ statusCode: 404, statusMessage: "申请不存在" });
  }

  const scoringConfig = (application.activity?.scoringConfig || {}) as ScoringConfig;
  const maps = await loadAchievementMaps(application.items);

  let totalScore = 0;
  const updatedItems: ApplicationItemView[] = [];

  for (const item of application.items) {
    const display = getDisplayForAchievement(
      item.achievementType,
      item.achievementId,
      maps,
    );
    const scores = computeScoresForAchievement(
      item.achievementType,
      (display as any).achievement,
      scoringConfig,
      application.user.username,
    );

    await db
      .update(schema.applicationItems)
      .set({
        baseScore: scores.baseScore,
        multiplier: String(scores.multiplier),
        extraScore: scores.extraScore,
        finalScore: scores.finalScore,
      })
      .where(eq(schema.applicationItems.id, item.id));

    totalScore += scores.finalScore;
    updatedItems.push({
      id: item.id,
      applicationId: item.applicationId,
      achievementType: item.achievementType,
      achievementId: item.achievementId,
      baseScore: scores.baseScore,
      multiplier: scores.multiplier,
      extraScore: scores.extraScore,
      finalScore: scores.finalScore,
      displayName: display.displayName,
      displayType: display.displayType,
      typeKey: (display as any).typeKey,
      levelKey: (display as any).levelKey,
      achievementDate: (display as any).achievementDate || null,
    });
  }

  const beforeTotalScore = application.totalScore;
  const [updatedApplication] = await db
    .update(schema.applications)
    .set({ totalScore })
    .where(eq(schema.applications.id, application.id))
    .returning();

  return {
    application: updatedApplication,
    items: updatedItems,
    beforeTotalScore,
    afterTotalScore: totalScore,
  };
}

export async function listEligibleAchievements(activityId: number, username: string) {
  const activity = await db.query.activities.findFirst({
    where: eq(schema.activities.id, activityId),
  });

  if (!activity) {
    throw createError({ statusCode: 404, statusMessage: "活动不存在" });
  }

  const startDate = activity.startDate;
  const endDate = activity.endDate;

  const [awards, papers, patents, innovations] = await Promise.all([
    db.query.awards.findMany({
      where: and(
        sql`"awards"."members" @> ARRAY[${username}]::text[]`,
        eq(schema.awards.status, "approved"),
        gte(schema.awards.date, startDate),
        lte(schema.awards.date, endDate),
      ),
      with: {
        contest: true,
      },
      orderBy: schema.awards.date,
    }),
    db.query.papers.findMany({
      where: and(
        sql`"papers"."members" @> ARRAY[${username}]::text[]`,
        eq(schema.papers.status, "approved"),
        gte(schema.papers.date, startDate),
        lte(schema.papers.date, endDate),
      ),
      orderBy: schema.papers.date,
    }),
    db.query.patents.findMany({
      where: and(
        sql`"patents"."members" @> ARRAY[${username}]::text[]`,
        eq(schema.patents.status, "approved"),
        gte(schema.patents.date, startDate),
        lte(schema.patents.date, endDate),
      ),
      orderBy: schema.patents.date,
    }),
    db.query.innovations.findMany({
      where: and(
        sql`"innovations"."members" @> ARRAY[${username}]::text[]`,
        eq(schema.innovations.status, "approved"),
        gte(schema.innovations.date, startDate),
        lte(schema.innovations.date, endDate),
      ),
      orderBy: schema.innovations.date,
    }),
  ]);

  return {
    activity,
    awards,
    papers,
    patents,
    innovations,
  };
}
