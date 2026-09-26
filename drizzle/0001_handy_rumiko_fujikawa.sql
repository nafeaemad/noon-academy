CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"whatsapp" varchar(60) DEFAULT '+1 555 123 4567' NOT NULL,
	"email" varchar(220) DEFAULT 'hello@noonquran.academy' NOT NULL,
	"response_time_ar" varchar(160) DEFAULT 'عادة خلال 24 ساعة' NOT NULL,
	"response_time_en" varchar(160) DEFAULT 'Usually within 24 hours' NOT NULL,
	"facebook" varchar(220),
	"instagram" varchar(220)
);
