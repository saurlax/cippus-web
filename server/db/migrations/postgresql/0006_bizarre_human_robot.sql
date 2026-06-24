CREATE TYPE "public"."innovation_achievement_type" AS ENUM('award', 'paper', 'patent');--> statement-breakpoint
ALTER TABLE "innovations" ADD COLUMN "source_type" "innovation_achievement_type";--> statement-breakpoint
ALTER TABLE "innovations" ADD COLUMN "source_id" integer;