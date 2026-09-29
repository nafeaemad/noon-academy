import { boolean, integer, jsonb, numeric, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const bookingStatus = pgEnum("booking_status", ["pending", "confirmed", "cancelled", "completed"]);
export const reviewStatus = pgEnum("review_status", ["pending", "approved", "rejected"]);

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  titleAr: varchar("title_ar", { length: 180 }).notNull(),
  titleEn: varchar("title_en", { length: 180 }).notNull(),
  descriptionAr: text("description_ar").notNull(),
  descriptionEn: text("description_en").notNull(),
  levelAr: varchar("level_ar", { length: 120 }).notNull(),
  levelEn: varchar("level_en", { length: 120 }).notNull(),
  ageAr: varchar("age_ar", { length: 80 }).notNull(),
  ageEn: varchar("age_en", { length: 80 }).notNull(),
  duration: integer("duration").notNull().default(30),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  nameAr: varchar("name_ar", { length: 160 }).notNull(),
  nameEn: varchar("name_en", { length: 160 }).notNull(),
  specialtyAr: varchar("specialty_ar", { length: 200 }).notNull(),
  specialtyEn: varchar("specialty_en", { length: 200 }).notNull(),
  qualificationsAr: text("qualifications_ar").notNull(),
  qualificationsEn: text("qualifications_en").notNull(),
  languages: jsonb("languages").$type<string[]>().notNull().default([]),
  yearsExperience: integer("years_experience"),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
  available: boolean("available").notNull().default(true),
  availabilityAr: varchar("availability_ar", { length: 160 }).notNull().default("متاح الآن"),
  availabilityEn: varchar("availability_en", { length: 160 }).notNull().default("Available now"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 220 }).notNull().unique(),
  passwordHash: text("password_hash"),
  provider: varchar("provider", { length: 20 }).notNull().default("credentials"),
  googleId: varchar("google_id", { length: 120 }).unique(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  reference: varchar("reference", { length: 24 }).notNull().unique(),
  program: varchar("program", { length: 120 }).notNull(),
  level: varchar("level", { length: 80 }).notNull(),
  age: integer("age").notNull(),
  lessonLanguage: varchar("lesson_language", { length: 40 }).notNull(),
  teacherId: integer("teacher_id"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  duration: integer("duration").notNull(),
  timezone: varchar("timezone", { length: 100 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 220 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 60 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  notes: text("notes"),
  status: bookingStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("booking_slot_unique").on(table.startsAt)]);

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  firstName: varchar("first_name", { length: 80 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  program: varchar("program", { length: 120 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  status: reviewStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 220 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  senderType: varchar("sender_type", { length: 10 }).notNull(), // "user" | "admin"
  body: text("body").notNull(),
  readByUser: boolean("read_by_user").notNull().default(false),
  readByAdmin: boolean("read_by_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userPushSubscriptions = pgTable("user_push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pushConfig = pgTable("push_config", {
  id: integer("id").primaryKey().default(1),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  titleAr: varchar("title_ar", { length: 220 }).notNull(),
  titleEn: varchar("title_en", { length: 220 }).notNull(),
  excerptAr: varchar("excerpt_ar", { length: 320 }).notNull(),
  excerptEn: varchar("excerpt_en", { length: 320 }).notNull(),
  contentAr: text("content_ar").notNull(),
  contentEn: text("content_en").notNull(),
  coverImageUrl: varchar("cover_image_url", { length: 500 }),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const siteContent = pgTable("site_content", {
  key: varchar("key", { length: 120 }).primaryKey(),
  valueAr: text("value_ar").notNull(),
  valueEn: text("value_en").notNull(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  whatsapp: varchar("whatsapp", { length: 60 }).notNull().default("+1 555 123 4567"),
  email: varchar("email", { length: 220 }).notNull().default("hello@noonquran.academy"),
  responseTimeAr: varchar("response_time_ar", { length: 160 }).notNull().default("عادة خلال 24 ساعة"),
  responseTimeEn: varchar("response_time_en", { length: 160 }).notNull().default("Usually within 24 hours"),
  facebook: varchar("facebook", { length: 220 }),
  instagram: varchar("instagram", { length: 220 }),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  nameAr: varchar("name_ar", { length: 120 }).notNull(),
  nameEn: varchar("name_en", { length: 120 }).notNull(),
  lessonCount: integer("lesson_count").notNull(),
  duration: integer("duration").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("USD"),
  active: boolean("active").notNull().default(true),
});
