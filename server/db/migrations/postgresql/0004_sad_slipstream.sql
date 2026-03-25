ALTER TABLE "awards" ALTER COLUMN "members" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "awards" ALTER COLUMN "members" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "innovations" ALTER COLUMN "members" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "innovations" ALTER COLUMN "members" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "papers" ALTER COLUMN "members" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "papers" ALTER COLUMN "members" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "patents" ALTER COLUMN "members" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "patents" ALTER COLUMN "members" SET DEFAULT '{}';