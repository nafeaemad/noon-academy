import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, teachers, teacherLedger, users, lessonTransactions, chatMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { notifyUser } from "@/lib/push";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const bookingId = Number(id);

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  if (!booking) return NextResponse.json({ error: "الحجز غير موجود." }, { status: 404 });
  if (booking.creditedAt) {
    return NextResponse.json({ error: "تم بالفعل تسجيل قبض هذه الحصة من قبل." }, { status: 409 });
  }
  if (!booking.teacherId) {
    return NextResponse.json({ error: "لازم تحدد المدرس المسؤول عن الحصة الأول قبل تسجيلها كمكتملة." }, { status: 400 });
  }

  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, booking.teacherId));
  if (!teacher) return NextResponse.json({ error: "المدرس المرتبط بالحجز غير موجود." }, { status: 404 });

  const rate = teacher.ratePerLesson;

  const [updatedBooking] = await db
    .update(bookings)
    .set({ status: "completed", creditedAt: new Date() })
    .where(eq(bookings.id, bookingId))
    .returning();

  await db.insert(teacherLedger).values({
    teacherId: teacher.id,
    bookingId: booking.id,
    amount: rate,
    type: "credit",
    note: `حصة ${booking.reference} — ${booking.name}`,
  });

  let debited = false;
  if (booking.userId) {
    await db
      .update(users)
      .set({ lessonBalance: sql`${users.lessonBalance} - 1` })
      .where(eq(users.id, booking.userId));
    await db.insert(lessonTransactions).values({
      userId: booking.userId,
      delta: -1,
      reason: `استهلاك حصة — ${booking.reference}`,
      bookingId: booking.id,
    });
    debited = true;

    const message = "تم بحمد الله إكمال حصتك، سعدنا بوجودك معنا. تم خصم حصة من رصيدك.";
    await db.insert(chatMessages).values({
      userId: booking.userId,
      senderType: "admin",
      body: message,
      readByUser: false,
      readByAdmin: true,
    });
    await notifyUser(booking.userId, {
      title: "تم إكمال حصتك 🎉",
      body: message,
      url: "/account/chat",
      tag: `booking-${bookingId}`,
    });
  }

  return NextResponse.json({ booking: updatedBooking, credited: rate, debited });
}
