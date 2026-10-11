ALTER TABLE "teacher_requests" ADD COLUMN "requested_rate" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "teacher_requests" ADD COLUMN "previous_rate" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "teacher_requests" ADD COLUMN "auto_activate" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "teacher_requests" ADD COLUMN "effective_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "teacher_requests" ADD COLUMN "applied" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "currency" varchar(10) DEFAULT 'EGP' NOT NULL;