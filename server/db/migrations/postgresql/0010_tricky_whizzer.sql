CREATE TYPE "public"."certificate_status" AS ENUM('none', 'pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "awards" ADD COLUMN "certificate_status" "certificate_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "awards" ADD COLUMN "certificate_evidences" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "innovations" ADD COLUMN "certificate_status" "certificate_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "innovations" ADD COLUMN "certificate_evidences" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "papers" ADD COLUMN "certificate_status" "certificate_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "papers" ADD COLUMN "certificate_evidences" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "patents" ADD COLUMN "certificate_status" "certificate_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "patents" ADD COLUMN "certificate_evidences" text[] DEFAULT '{}' NOT NULL;