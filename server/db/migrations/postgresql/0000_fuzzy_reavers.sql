CREATE TYPE "public"."award_level" AS ENUM('national', 'provincial', 'municipal', 'school', 'college');--> statement-breakpoint
CREATE TYPE "public"."award_type" AS ENUM('first_prize', 'second_prize', 'third_prize', 'first_place', 'second_place', 'third_place', 'fourth_place', 'fifth_place', 'sixth_place', 'other', 'recommended_not_awarded');--> statement-breakpoint
CREATE TYPE "public"."innovation_type" AS ENUM('excellent', 'qualified');--> statement-breakpoint
CREATE TYPE "public"."paper_type" AS ENUM('influential', 'other');--> statement-breakpoint
CREATE TYPE "public"."patent_type" AS ENUM('domestic_invention', 'international_invention', 'utility_model', 'design', 'software_copyright');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('draft', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" integer NOT NULL,
	"award_id" integer NOT NULL,
	"status" "review_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "awards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"contest_id" integer NOT NULL,
	"level" "award_level" NOT NULL,
	"type" "award_type" NOT NULL,
	"status" "review_status" DEFAULT 'draft' NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contests" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "innovations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" "innovation_type" NOT NULL,
	"status" "review_status" DEFAULT 'draft' NOT NULL,
	"date" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notices" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "papers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" "paper_type" NOT NULL,
	"status" "review_status" DEFAULT 'draft' NOT NULL,
	"date" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" "patent_type" NOT NULL,
	"status" "review_status" DEFAULT 'draft' NOT NULL,
	"date" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text,
	"name" text,
	"bio" text,
	"email" text,
	"gender" text,
	"college" text,
	"admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_award_id_awards_id_fk" FOREIGN KEY ("award_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "awards" ADD CONSTRAINT "awards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "awards" ADD CONSTRAINT "awards_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "innovations" ADD CONSTRAINT "innovations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "papers" ADD CONSTRAINT "papers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "patents" ADD CONSTRAINT "patents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;