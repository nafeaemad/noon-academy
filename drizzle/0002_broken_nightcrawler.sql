CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title_ar" varchar(220) NOT NULL,
	"title_en" varchar(220) NOT NULL,
	"excerpt_ar" varchar(320) NOT NULL,
	"excerpt_en" varchar(320) NOT NULL,
	"content_ar" text NOT NULL,
	"content_en" text NOT NULL,
	"cover_image_url" varchar(500),
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "available" boolean DEFAULT true NOT NULL;