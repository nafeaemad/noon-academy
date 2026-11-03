ALTER TABLE "bookings" ADD COLUMN "plan_id" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "original_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "discount_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "final_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "price_currency" varchar(8);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "discount_label" varchar(200);--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "discount_type" varchar(10);--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "discount_value" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "discount_note_ar" text;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "discount_note_en" text;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "discount_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "discount_type" varchar(10);--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "discount_value" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "discount_note_ar" text;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "discount_note_en" text;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "discount_ends_at" timestamp with time zone;