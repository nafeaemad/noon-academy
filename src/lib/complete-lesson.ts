import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, chatMessages, lessonTransactions, teacherLedger, teachers, users } from "@/db/schema";
import { notifyTeacher, notifyUser } from "@/lib/push";

export type CompleteLessonResult =
  | { ok: true; booking: typeof bookings.$inferSelect; credited: string; debited: boolean; lessonBalance: number | null }
  | { ok: false; status: number; error: string };

/**
 * Marks a lesson as taken: credits the teacher's ledger at their per-lesson rate and debits one
 * lesson from the student's balance, then notifies both. Safe to call more than once (an admin
 * click and a student "Join" click can race): the booking row is claimed atomically by setting
 * credited_at only where it is still null, so only the first caller charges anything.
 */
export async function completeLesson(bookingId: number, trigger: "admin" | "student_join"): Promise<CompleteLessonResult> {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  if (!booking) return { ok: false, status: 404, error: "الحجز غير موجود." };
  if (booking.creditedAt) return { ok: false, status: 409, error: "تم بالفعل تسجيل قبض هذه الحصة من قبل." };
  if (!booking.teacherId) {
    return { ok: false, status: 400, error: "لازم تحدد المدرس المسؤول عن الحصة الأول قبل تسجيلها كمكتملة." };
  }

  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, booking.teacherId));
  if (!teacher) return { ok: false, status: 404, error: "المدرس المرتبط بالحجز غير موجود." };

  // Atomic claim: only one concurrent caller gets a row back.
  const [claimed] = await db
    .update(bookings)
    .set({ status: "completed", creditedAt: new Date() })
    .where(and(eq(bookings.id, bookingId), isNull(bookings.creditedAt)))
    .returning();
  if (!claimed) return { ok: false, status: 409, error: "تم بالفعل تسجيل قبض هذه الحصة من قبل." };

  const rate = teacher.ratePerLesson;

  await db.insert(teacherLedger).values({
    teacherId: teacher.id,
    bookingId: booking.id,
    amount: rate,
    type: "credit",
    note: `حصة ${booking.reference} — ${booking.name}`,
  });

  const [{ teacherBalance }] = await db
    .select({ teacherBalance: sql<string>`coalesce(sum(${teacherLedger.amount}), 0)` })
    .from(teacherLedger)
    .where(eq(teacherLedger.teacherId, teacher.id));

  await notifyTeacher(teacher.id, {
    title: trigger === "student_join" ? "الطالب دخل الحصة — تم قبضها 💰" : "تم قبض حصة جديدة 💰",
    body: `تم إضافة ${Number(rate).toFixed(2)} ${teacher.currency} لحسابك عن حصة ${booking.reference} (${booking.name}). رصيدك الحالي: ${Number(teacherBalance).toFixed(2)} ${teacher.currency}.`,
    url: "/teacher",
    tag: `teacher-credit-${bookingId}`,
  });

  let debited = false;
  let lessonBalance: number | null = null;
  if (booking.userId) {
    const [updatedUser] = await db
      .update(users)
      .set({ lessonBalance: sql`${users.lessonBalance} - 1` })
      .where(eq(users.id, booking.userId))
      .returning();
    await db.insert(lessonTransactions).values({
      userId: booking.userId,
      delta: -1,
      reason: `استهلاك حصة — ${booking.reference}`,
      bookingId: booking.id,
    });
    debited = true;
    lessonBalance = updatedUser.lessonBalance;

    const message =
      trigger === "student_join"
        ? `تم تسجيل دخولك للحصة وخصم حصة من رصيدك — رصيدك المتبقي: ${updatedUser.lessonBalance} حصة. بالتوفيق!`
        : `تم بحمد الله إكمال حصتك، سعدنا بوجودك معنا. تم خصم حصة من رصيدك — رصيدك المتبقي: ${updatedUser.lessonBalance} حصة.`;
    await db.insert(chatMessages).values({
      userId: booking.userId,
      senderType: "admin",
      body: message,
      readByUser: false,
      readByAdmin: true,
    });
    await notifyUser(booking.userId, {
      title: trigger === "student_join" ? "تم احتساب حصتك ✓" : "تم إكمال حصتك 🎉",
      body: message,
      url: "/account/chat",
      tag: `booking-${bookingId}`,
    });
  }

  return { ok: true, booking: claimed, credited: rate, debited, lessonBalance };
}
