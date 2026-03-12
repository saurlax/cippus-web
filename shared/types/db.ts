import {
  users,
  contests,
  awards,
  awardLevelEnum,
  awardTypeEnum,
} from "@nuxthub/db/schema";

export type User = typeof users.$inferSelect;
export type Contest = typeof contests.$inferSelect;
export type Award = typeof awards.$inferSelect;

export type NewUser = typeof users.$inferInsert;
export type NewContest = typeof contests.$inferInsert;
export type NewAward = typeof awards.$inferInsert;

export const awardLevelValues = awardLevelEnum.enumValues;
export type AwardLevel = (typeof awardLevelValues)[number];

export const awardTypeValues = awardTypeEnum.enumValues;
export type AwardType = (typeof awardTypeValues)[number];
