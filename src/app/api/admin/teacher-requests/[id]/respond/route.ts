import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherRequests, teachers, bookings, chatMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { notifyTeacher, notifyUser } from "@/lib/push";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const requestId = Number(id);
  const body = await req.json();
  const approve = Boolean(body.approve);
  const adminNote = String(body.note || "").trim() || null;

  const [request] = await db.select().from(teacherRequests).where(eq(teacherRequests.id, requestId));
  if (!request) return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
  if (request.status !== "pending") {
    return NextResponse.json({ error: "تم الرد على هذا الطلب بالفعل." }, { status: 409 });
  }

  const [updated] = await db
    .update(teacherRequests)
    .set({ status: approve ? "approved" : "rejected", adminNote, resolvedAt: new Date() })
    .where(eq(teacherRequests.id, requestId))
    .returning();

  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, request.teacherId));

  if (approve && request.type === "leave" && teacher) {
    await db
      .update(teachers)
      .set({
        excused: true,
        excuseReason: request.reason,
        availabilityAr: "معتذر حاليًا",
        availabilityEn: "Currently excused",
      })
      .where(eq(teachers.id, teacher.id));
  }

  if (approve && request.type === "cancel_lesson" && request.bookingId) {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, request.bookingId));
    if (booking && booking.status !== "completed") {
      await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, booking.id));
      if (booking.userId) {
        const message = `نأسف، تم إلغاء حصتك يوم ${new Date(booking.startsAt).toLocaleString("ar-EG")} بناءً على طلب المدرس. هنتواصل معك لتحديد موعد بديل.`;
        await db.insert(chatMessages).values({
          userId: booking.userId,
          senderType: "admin",
          body: message,
          readByUser: false,
          readByAdmin: true,
        });
        await notifyUser(booking.userId, {
          title: "تم إلغاء حصتك",
          body: message,
          url: "/account/chat",
          tag: `booking-${booking.id}`,
        });
      }
    }
  }

  if (teacher) {
    await notifyTeacher(teacher.id, {
      title: approve ? "تمت الموافقة على طلبك ✓" : "تم رفض طلبك",
      body: adminNote || (approve ? "وافقت الإدارة على طلبك." : "تم رفض الطلب من الإدارة."),
      url: "/teacher",
      tag: `teacher-request-${requestId}`,
    });
  }

  return NextResponse.json(updated);
}
