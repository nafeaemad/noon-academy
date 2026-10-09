CREATE TABLE "lesson_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"delta" integer NOT NULL,
	"reason" varchar(160) NOT NULL,
	"booking_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"date" varchar(10) NOT NULL,
	"status" varchar(12) DEFAULT 'present' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"booking_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"type" varchar(20) DEFAULT 'credit' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "credited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "email" varchar(220);--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "approved" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "meeting_link" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "excused" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "excuse_reason" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "rate_per_lesson" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lesson_balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_transactions" ADD CONSTRAINT "lesson_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_transactions" ADD CONSTRAINT "lesson_transactions_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_attendance" ADD CONSTRAINT "teacher_attendance_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_ledger" ADD CONSTRAINT "teacher_ledger_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_ledger" ADD CONSTRAINT "teacher_ledger_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "teacher_attendance_day_unique" ON "teacher_attendance" USING btree ("teacher_id","date");--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_email_unique" UNIQUE("email");