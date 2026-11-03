CREATE TABLE "discounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(10) DEFAULT 'percent' NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"label_ar" varchar(160) DEFAULT '' NOT NULL,
	"label_en" varchar(160) DEFAULT '' NOT NULL,
	"message_ar" text DEFAULT '' NOT NULL,
	"message_en" text DEFAULT '' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"sort" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
