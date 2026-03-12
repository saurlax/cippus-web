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

export const awardLevels = awardLevelEnum.enumValues as readonly string[];
export const awardTypes = awardTypeEnum.enumValues as readonly string[];

export const awardLevelItems = awardLevels.map((v) => ({ value: v, label: v }));
export const awardTypeItems = awardTypes.map((v) => ({ value: v, label: v }));
