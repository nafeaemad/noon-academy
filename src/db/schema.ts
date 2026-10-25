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
  // Teacher portal: self-service login + payroll
  email: varchar("email", { length: 220 }).unique(),
  phone: varchar("phone", { length: 60 }),
  passwordHash: text("password_hash"),
  approved: boolean("approved").notNull().default(true),
  meetingLink: text("meeting_link"),
  excused: boolean("excused").notNull().default(false),
  excuseReason: text("excuse_reason"),
  ratePerLesson: numeric("rate_per_lesson", { precision: 10, scale: 2 }).notNull().default("0"),
  currency: varchar("currency", { length: 10 }).notNull().default("EGP"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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
  lessonBalance: integer("lesson_balance").notNull().default(0),
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
  creditedAt: timestamp("credited_at", { withTimezone: true }),
  reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
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
  teachersVisible: boolean("teachers_visible").notNull().default(true),
  studentReminderMsg: text("student_reminder_msg"),
  teacherReminderMsg: text("teacher_reminder_msg"),
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

// Teacher payroll ledger: one row per credit (completed lesson) or payout (admin paid the teacher).
export const teacherLedger = pgTable("teacher_ledger", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("credit"), // credit | payout | adjustment
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Daily attendance / absence log per teacher.
export const teacherAttendance = pgTable("teacher_attendance", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  status: varchar("status", { length: 12 }).notNull().default("present"), // present | absent | excused
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("teacher_attendance_day_unique").on(table.teacherId, table.date)]);

// Student lesson-balance audit log (purchases, admin adjustments, consumption on completed lessons).
export const lessonTransactions = pgTable("lesson_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: varchar("reason", { length: 160 }).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teacherPushSubscriptions = pgTable("teacher_push_subscriptions", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Teacher requests: leave (إجازة/اعتذار), cancelling a specific lesson, or asking to change their lesson price — reviewed by admin.
export const teacherRequests = pgTable("teacher_requests", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // leave | cancel_lesson | rate_change
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 12 }).notNull().default("pending"), // pending | approved | rejected
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  // Price-change requests (type = rate_change) only:
  requestedRate: numeric("requested_rate", { precision: 10, scale: 2 }),
  previousRate: numeric("previous_rate", { precision: 10, scale: 2 }),
  autoActivate: boolean("auto_activate").notNull().default(false),
  effectiveAt: timestamp("effective_at", { withTimezone: true }),
  applied: boolean("applied").notNull().default(false),
});
