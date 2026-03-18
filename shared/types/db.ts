import {
  users,
  contests,
  activities,
  applications,
  applicationItems,
  awards,
  papers,
  patents,
  innovations,
  achievementTypeEnum,
  awardLevelEnum,
  awardTypeEnum,
  reviewStatusEnum,
  paperTypeEnum,
  patentTypeEnum,
  innovationTypeEnum,
} from "@nuxthub/db/schema";

export type User = typeof users.$inferSelect;
export type Contest = typeof contests.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type ApplicationItem = typeof applicationItems.$inferSelect;
export type Award = typeof awards.$inferSelect;
export type Paper = typeof papers.$inferSelect;
export type Patent = typeof patents.$inferSelect;
export type Innovation = typeof innovations.$inferSelect;

export type NewUser = typeof users.$inferInsert;
export type NewContest = typeof contests.$inferInsert;
export type NewActivity = typeof activities.$inferInsert;
export type NewApplication = typeof applications.$inferInsert;
export type NewApplicationItem = typeof applicationItems.$inferInsert;
export type NewAward = typeof awards.$inferInsert;
export type NewPaper = typeof papers.$inferInsert;
export type NewPatent = typeof patents.$inferInsert;
export type NewInnovation = typeof innovations.$inferInsert;

export const achievementTypeValues = achievementTypeEnum.enumValues;
export type AchievementType = (typeof achievementTypeValues)[number];

export const reviewStatusValues = reviewStatusEnum.enumValues;
export type ReviewStatus = (typeof reviewStatusValues)[number];

export const awardLevelValues = awardLevelEnum.enumValues;
export type AwardLevel = (typeof awardLevelValues)[number];

export const awardTypeValues = awardTypeEnum.enumValues;
export type AwardType = (typeof awardTypeValues)[number];

export const paperTypeValues = paperTypeEnum.enumValues;
export type PaperType = (typeof paperTypeValues)[number];

export const patentTypeValues = patentTypeEnum.enumValues;
export type PatentType = (typeof patentTypeValues)[number];

export const innovationTypeValues = innovationTypeEnum.enumValues;
export type InnovationType = (typeof innovationTypeValues)[number];
