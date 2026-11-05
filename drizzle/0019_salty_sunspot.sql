ALTER TABLE "discounts" ADD COLUMN "scope" varchar(10) DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE "discounts" ADD COLUMN "targets" jsonb;