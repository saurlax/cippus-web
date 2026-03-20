import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const reviewStatusEnum = pgEnum("review_status", [
  "draft",
  "pending",
  "approved",
  "rejected",
]);

export const awardLevelEnum = pgEnum("award_level", [
  "national",
  "provincial",
  "municipal",
  "school",
  "college",
]);

export const awardTypeEnum = pgEnum("award_type", [
  "first_prize",
  "second_prize",
  "third_prize",
  "first_place",
  "second_place",
  "third_place",
  "fourth_place",
  "fifth_place",
  "sixth_place",
  "other",
  "recommended_not_awarded",
]);

export const paperTypeEnum = pgEnum("paper_type", [
  "influential",
  "other",
]);

export const patentTypeEnum = pgEnum("patent_type", [
  "domestic_invention",
  "international_invention",
  "utility_model",
  "design",
  "software_copyright",
]);

export const innovationTypeEnum = pgEnum("innovation_type", [
  "excellent",
  "qualified",
]);

export const achievementTypeEnum = pgEnum("achievement_type", [
  "award",
  "paper",
  "patent",
  "innovation",
]);

export type ScoringValue = string | number | boolean;
export type ScoringConfig = Record<string, ScoringValue>;

export const defaultScoringConfig: ScoringConfig = {
  // 国家级
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

  // 省级
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

  // 市级
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

  // 校级
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

  // 学院级
  "award.college.first_place": 3,
  "award.college.second_place": 2,
  "award.college.third_place": 1,
  "award.college.recommended_not_awarded": 1,

  // 论文
  "paper.influential": 20,
  "paper.other": 10,

  // 专利
  "patent.domestic_invention": 20,
  "patent.international_invention": 25,
  "patent.utility_model": 10,
  "patent.design": 5,
  "patent.software_copyright": 10,

  // 大创
  "innovation.excellent": 5,
  "innovation.qualified": 3,
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  name: text("name"),
  bio: text("bio"),
  email: text("email"),
  gender: text("gender", { enum: ["male", "female"] }),
  college: text("college"),
  admin: boolean("admin").notNull().default(false),
});

export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const awards = pgTable("awards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  contestId: integer("contest_id")
    .notNull()
    .references(() => contests.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  level: awardLevelEnum("level").notNull(),
  type: awardTypeEnum("type").notNull(),
  evidences: text("evidences").array().notNull().default([]),
  status: reviewStatusEnum("status").notNull().default("draft"),
  date: timestamp("date", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const papers = pgTable("papers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: text("name").notNull(),
  type: paperTypeEnum("type").notNull(),
  evidences: text("evidences").array().notNull().default([]),
  status: reviewStatusEnum("status").notNull().default("draft"),
  date: timestamp("date", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patents = pgTable("patents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: text("name").notNull(),
  type: patentTypeEnum("type").notNull(),
  evidences: text("evidences").array().notNull().default([]),
  status: reviewStatusEnum("status").notNull().default("draft"),
  date: timestamp("date", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const innovations = pgTable("innovations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: text("name").notNull(),
  type: innovationTypeEnum("type").notNull(),
  evidences: text("evidences").array().notNull().default([]),
  status: reviewStatusEnum("status").notNull().default("draft"),
  date: timestamp("date", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  scoringConfig: jsonb("scoring_config")
    .$type<ScoringConfig>()
    .notNull()
    .default(defaultScoringConfig),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  activityId: integer("activity_id")
    .notNull()
    .references(() => activities.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  totalScore: integer("total_score").notNull().default(0),
  status: reviewStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const applicationItems = pgTable(
  "application_items",
  {
    id: serial("id").primaryKey(),
    applicationId: integer("application_id")
      .notNull()
      .references(() => applications.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    achievementType: achievementTypeEnum("achievement_type").notNull(),
    achievementId: integer("achievement_id").notNull(),
    baseScore: integer("base_score").notNull().default(0),
    multiplier: numeric("multiplier", { precision: 8, scale: 2 })
      .notNull()
      .default("1"),
    extraScore: integer("extra_score").notNull().default(0),
    finalScore: integer("final_score").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    applicationIdIdx: index("application_items_application_id_idx").on(
      table.applicationId,
    ),
    achievementLookupIdx: index("application_items_achievement_lookup_idx").on(
      table.achievementType,
      table.achievementId,
    ),
    applicationAchievementUnique: uniqueIndex(
      "application_items_application_achievement_unique",
    ).on(table.applicationId, table.achievementType, table.achievementId),
  }),
);

export const activitiesRelations = relations(activities, ({ many }) => ({
  applications: many(applications),
}));

export const awardsRelations = relations(awards, ({ one }) => ({
  contest: one(contests, {
    fields: [awards.contestId],
    references: [contests.id],
  }),
  user: one(users, {
    fields: [awards.userId],
    references: [users.id],
  }),
}));

export const papersRelations = relations(papers, ({ one }) => ({
  user: one(users, {
    fields: [papers.userId],
    references: [users.id],
  }),
}));

export const patentsRelations = relations(patents, ({ one }) => ({
  user: one(users, {
    fields: [patents.userId],
    references: [users.id],
  }),
}));

export const innovationsRelations = relations(
  innovations,
  ({ one }) => ({
    user: one(users, {
      fields: [innovations.userId],
      references: [users.id],
    }),
  }),
);

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  activity: one(activities, {
    fields: [applications.activityId],
    references: [activities.id],
  }),
  items: many(applicationItems),
}));

export const applicationItemsRelations = relations(
  applicationItems,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationItems.applicationId],
      references: [applications.id],
    }),
  }),
);
