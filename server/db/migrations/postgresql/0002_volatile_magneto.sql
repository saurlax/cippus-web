CREATE TYPE "public"."achievement_type" AS ENUM('award', 'paper', 'patent', 'innovation');--> statement-breakpoint
CREATE TABLE "application_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"achievement_type" "achievement_type" NOT NULL,
	"achievement_id" integer NOT NULL,
	"base_score" integer DEFAULT 0 NOT NULL,
	"multiplier" numeric(8, 2) DEFAULT '1' NOT NULL,
	"extra_score" integer DEFAULT 0 NOT NULL,
	"final_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" DROP CONSTRAINT "applications_award_id_awards_id_fk";
--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "scoring_config" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "total_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "application_items" ADD CONSTRAINT "application_items_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "application_items_application_id_idx" ON "application_items" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_items_achievement_lookup_idx" ON "application_items" USING btree ("achievement_type","achievement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "application_items_application_achievement_unique" ON "application_items" USING btree ("application_id","achievement_type","achievement_id");--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "award_id";