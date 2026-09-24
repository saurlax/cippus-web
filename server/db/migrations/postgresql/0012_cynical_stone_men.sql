ALTER TABLE "users" ADD COLUMN "auth_provider" text DEFAULT 'local' NOT NULL;--> statement-breakpoint
UPDATE "users" SET "auth_provider" = 'cas' WHERE "password" IS NULL;
