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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  name: text("name"),
  bio: text("bio"),
  email: text("email"),
  gender: text("gender", { enum: ["male", "female"] })
    .notNull()
    .default("male"),
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

export const awardTypes = pgTable("award_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const awards = pgTable("awards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contestId: integer("contest_id").notNull(),
  awardTypeId: integer("award_type_id")
    .notNull()
    .references(() => awardTypes.id),
  status: reviewStatusEnum("status").notNull().default("draft"),
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
    .references(() => activities.id),
  awardId: integer("award_id")
    .notNull()
    .references(() => awards.id),
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
  awardType: one(awardTypes, {
    fields: [awards.awardTypeId],
    references: [awardTypes.id],
  }),
  contest: one(contests, {
    fields: [awards.contestId],
    references: [contests.id],
  }),
  user: one(users, {
    fields: [awards.userId],
    references: [users.id],
  }),
}));

export const awardTypesRelations = relations(awardTypes, ({ many }) => ({
  awards: many(awards),
}));

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
