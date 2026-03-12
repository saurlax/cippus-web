CREATE TABLE "award_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "award_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "awards" ADD COLUMN "award_type_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "awards" ADD CONSTRAINT "awards_award_type_id_award_types_id_fk" FOREIGN KEY ("award_type_id") REFERENCES "public"."award_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "awards" DROP COLUMN "level";--> statement-breakpoint
ALTER TABLE "awards" DROP COLUMN "type";--> statement-breakpoint
DROP TYPE "public"."award_level";--> statement-breakpoint
DROP TYPE "public"."award_type";