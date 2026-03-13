import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
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
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id")
    .notNull()
    .references(() => activities.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  awardId: integer("award_id")
    .notNull()
    .references(() => awards.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  status: reviewStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const activitiesRelations = relations(activities, ({ many }) => ({
  applications: many(applications),
}));

export const awardsRelations = relations(awards, ({ many, one }) => ({
  applications: many(applications),
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

export const applicationsRelations = relations(applications, ({ one }) => ({
  activity: one(activities, {
    fields: [applications.activityId],
    references: [activities.id],
  }),
  award: one(awards, {
    fields: [applications.awardId],
    references: [awards.id],
  }),
}));
