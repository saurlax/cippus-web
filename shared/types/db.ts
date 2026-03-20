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

export type ScoringValue = string | number | boolean;
export type ScoringConfig = Record<string, ScoringValue>;

export const activityDefaultScoringConfig: ScoringConfig = {
  "award.national.first_place": 20,
  "award.national.second_place": 18,
  "award.national.third_place": 16,
  "award.national.fourth_place": 14,
  "award.national.fifth_place": 13,
  "award.national.sixth_place": 12,
  "award.national.first_prize": 20,
  "award.national.second_prize": 17,
  "award.national.third_prize": 14,
  "award.national.other": 6,
  "award.national.recommended_not_awarded": 5,
  "award.provincial.first_place": 15,
  "award.provincial.second_place": 13,
  "award.provincial.third_place": 11,
  "award.provincial.fourth_place": 9,
  "award.provincial.fifth_place": 8,
  "award.provincial.sixth_place": 7,
  "award.provincial.first_prize": 15,
  "award.provincial.second_prize": 12,
  "award.provincial.third_prize": 9,
  "award.provincial.other": 4,
  "award.provincial.recommended_not_awarded": 3,
  "award.municipal.first_place": 11,
  "award.municipal.second_place": 9,
  "award.municipal.third_place": 7,
  "award.municipal.fourth_place": 5,
  "award.municipal.fifth_place": 4,
  "award.municipal.sixth_place": 3,
  "award.municipal.first_prize": 11,
  "award.municipal.second_prize": 8,
  "award.municipal.third_prize": 5,
  "award.municipal.other": 3,
  "award.municipal.recommended_not_awarded": 2,
  "award.school.first_place": 6,
  "award.school.second_place": 5,
  "award.school.third_place": 4,
  "award.school.fourth_place": 3,
  "award.school.fifth_place": 2,
  "award.school.sixth_place": 1,
  "award.school.first_prize": 6,
  "award.school.second_prize": 4,
  "award.school.third_prize": 2,
  "award.school.other": 1,
  "award.college.first_place": 3,
  "award.college.second_place": 2,
  "award.college.third_place": 1,
  "award.college.recommended_not_awarded": 1,
  "paper.influential": 20,
  "paper.other": 10,
  "patent.domestic_invention": 20,
  "patent.international_invention": 25,
  "patent.utility_model": 10,
  "patent.design": 5,
  "patent.software_copyright": 10,
  "innovation.excellent": 5,
  "innovation.qualified": 3,
};
