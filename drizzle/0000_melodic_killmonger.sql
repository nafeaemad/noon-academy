CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(24) NOT NULL,
	"program" varchar(120) NOT NULL,
	"level" varchar(80) NOT NULL,
	"age" integer NOT NULL,
	"lesson_language" varchar(40) NOT NULL,
	"teacher_id" integer,
	"starts_at" timestamp with time zone NOT NULL,
	"duration" integer NOT NULL,
	"timezone" varchar(100) NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(220) NOT NULL,
	"whatsapp" varchar(60) NOT NULL,
	"country" varchar(100) NOT NULL,
	"notes" text,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(220) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_ar" varchar(120) NOT NULL,
	"name_en" varchar(120) NOT NULL,
	"lesson_count" integer NOT NULL,
	"duration" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(8) DEFAULT 'USD' NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title_ar" varchar(180) NOT NULL,
	"title_en" varchar(180) NOT NULL,
	"description_ar" text NOT NULL,
	"description_en" text NOT NULL,
	"level_ar" varchar(120) NOT NULL,
	"level_en" varchar(120) NOT NULL,
	"age_ar" varchar(80) NOT NULL,
	"age_en" varchar(80) NOT NULL,
	"duration" integer DEFAULT 30 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "programs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(80) NOT NULL,
	"country" varchar(100) NOT NULL,
	"program" varchar(120) NOT NULL,
	"category" varchar(80) NOT NULL,
	"rating" integer NOT NULL,
	"content" text NOT NULL,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_ar" varchar(160) NOT NULL,
	"name_en" varchar(160) NOT NULL,
	"specialty_ar" varchar(200) NOT NULL,
	"specialty_en" varchar(200) NOT NULL,
	"qualifications_ar" text NOT NULL,
	"qualifications_en" text NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"years_experience" integer,
	"image_url" text,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "booking_slot_unique" ON "bookings" USING btree ("starts_at");