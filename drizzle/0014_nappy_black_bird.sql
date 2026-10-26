CREATE TABLE "pricing_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" varchar(10) DEFAULT 'row' NOT NULL,
	"title_ar" varchar(160) NOT NULL,
	"title_en" varchar(160) NOT NULL,
	"col2_ar" varchar(160) DEFAULT '' NOT NULL,
	"col2_en" varchar(160) DEFAULT '' NOT NULL,
	"desc_ar" text DEFAULT '' NOT NULL,
	"desc_en" text DEFAULT '' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(8) DEFAULT 'USD' NOT NULL,
	"unit_ar" varchar(60) DEFAULT '' NOT NULL,
	"unit_en" varchar(60) DEFAULT '' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
INSERT INTO "pricing_items" ("kind","title_ar","title_en","col2_ar","col2_en","desc_ar","desc_en","price","currency","unit_ar","unit_en","sort") VALUES
('row','حصتان / أسبوع','2 Classes / Week','08 / شهر','08 / Month','','',28,'USD','/ شهر','/ Month',1),
('row','3 حصص / أسبوع','3 Classes / Week','12 / شهر','12 / Month','','',43,'USD','/ شهر','/ Month',2),
('row','4 حصص / أسبوع','4 Classes / Week','16 / شهر','16 / Month','','',56,'USD','/ شهر','/ Month',3),
('row','5 حصص / أسبوع','5 Classes / Week','20 / شهر','20 / Month','','',70,'USD','/ شهر','/ Month',4),
('row','حصص الحفظ (بالساعة)','Hifz Classes (hour)','20 ساعة / شهر','20 h / Month','','',125,'USD','/ شهر','/ Month',5),
('course','Quranic Arabic','Quranic Arabic','مدة الحصة 30 دقيقة','30-minute lessons','كورس يفهم فيه الطالب حوالي 50٪ من كلمات القرآن الكريم.','A course that helps the student understand about 50% of the words of the Quran.',8,'USD','/ حصة','/ lesson',6);
