ALTER TABLE "awards" ADD COLUMN "evidences" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "innovations" ADD COLUMN "evidences" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "papers" ADD COLUMN "evidences" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "patents" ADD COLUMN "evidences" text[] DEFAULT '{}' NOT NULL;