ALTER TABLE "pricing_items" ADD COLUMN "program_id" integer;--> statement-breakpoint
UPDATE "pricing_items" SET "program_id" = (SELECT "id" FROM "programs" WHERE "slug" = 'quranic-50-percent' LIMIT 1) WHERE "kind" = 'course' AND "title_en" = 'Quranic Arabic' AND "program_id" IS NULL;
