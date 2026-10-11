import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherRequests, teachers, bookings, chatMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { notifyTeacher, notifyUser } from "@/lib/push";

async function applyApproveEffects(request: typeof teacherRequests.$inferSelect, teacher: typeof teachers.$inferSelect | undefined) {
  if (request.type === "leave" && teacher) {
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

  if (request.type === "cancel_lesson" && request.bookingId) {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, request.bookingId));
    if (booking && booking.status !== "completed" && booking.status !== "cancelled") {
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
}

async function revertApproveEffects(request: typeof teacherRequests.$inferSelect, teacher: typeof teachers.$inferSelect | undefined) {
  if (request.type === "leave" && teacher && teacher.excuseReason === request.reason) {
    await db
      .update(teachers)
      .set({
        excused: false,
        excuseReason: null,
        availabilityAr: "متاح الآن",
        availabilityEn: "Available now",
      })
      .where(eq(teachers.id, teacher.id));
  }

  if (request.type === "cancel_lesson" && request.bookingId) {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, request.bookingId));
    if (booking && booking.status === "cancelled") {
      await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, booking.id));
      if (booking.userId) {
        const message = `تراجعت الإدارة عن إلغاء حصتك يوم ${new Date(booking.startsAt).toLocaleString("ar-EG")}، والحصة مؤكدة زي ما كانت.`;
        await db.insert(chatMessages).values({
          userId: booking.userId,
          senderType: "admin",
          body: message,
          readByUser: false,
          readByAdmin: true,
        });
        await notifyUser(booking.userId, {
          title: "حصتك اتأكدت تاني",
          body: message,
          url: "/account/chat",
          tag: `booking-${booking.id}`,
        });
      }
    }
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const requestId = Number(id);
  const body = await req.json();
  const approve = Boolean(body.approve);
  const adminNote = String(body.note || "").trim() || null;
  const newStatus = approve ? "approved" : "rejected";

  const [request] = await db.select().from(teacherRequests).where(eq(teacherRequests.id, requestId));
  if (!request) return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });

  const isEdit = request.status !== "pending";
  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, request.teacherId));

  // If this is an edit that flips the decision, undo the old side effects before applying the new ones.
  if (isEdit && request.status !== newStatus) {
    if (request.status === "approved") {
      await revertApproveEffects(request, teacher);
    }
    if (newStatus === "approved") {
      await applyApproveEffects(request, teacher);
    }
  } else if (!isEdit && approve) {
    await applyApproveEffects(request, teacher);
  }

  const [updated] = await db
    .update(teacherRequests)
    .set({ status: newStatus, adminNote, resolvedAt: new Date() })
    .where(eq(teacherRequests.id, requestId))
    .returning();

  if (teacher) {
    await notifyTeacher(teacher.id, {
      title: isEdit
        ? "الإدارة عدّلت الرد على طلبك"
        : approve
          ? "تمت الموافقة على طلبك ✓"
          : "تم رفض طلبك",
      body: adminNote || (approve ? "وافقت الإدارة على طلبك." : "تم رفض الطلب من الإدارة."),
      url: "/teacher",
      tag: `teacher-request-${requestId}`,
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const requestId = Number(id);

  const [request] = await db.select().from(teacherRequests).where(eq(teacherRequests.id, requestId));
  if (!request) return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });

  await db.delete(teacherRequests).where(eq(teacherRequests.id, requestId));
  return NextResponse.json({ ok: true });
}
