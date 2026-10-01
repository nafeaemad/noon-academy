import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, chatMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { notifyUser } from "@/lib/push";

const statusTitles: Record<string, string> = {
  pending: "تحديث على حجزك",
  confirmed: "تم تأكيد حجزك ✅",
  completed: "تم إكمال حصتك 🎉",
  cancelled: "تحديث بخصوص حجزك",
};

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const bookingId = Number(id);

  const body = await req.json();
  const status = String(body.status || "");
  const teacherId = body.teacherId ? Number(body.teacherId) : null;
  const message = String(body.message || "").trim().slice(0, 2000);

  if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "حالة غير صحيحة." }, { status: 400 });
  }

  const [existing] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  if (!existing) return NextResponse.json({ error: "الحجز غير موجود." }, { status: 404 });

  const [updated] = await db
    .update(bookings)
    .set({ status: status as typeof existing.status, teacherId })
    .where(eq(bookings.id, bookingId))
    .returning();

  let delivered = false;
  if (existing.userId && message) {
    await db.insert(chatMessages).values({
      userId: existing.userId,
      senderType: "admin",
      body: message,
      readByUser: false,
      readByAdmin: true,
    });
    await notifyUser(existing.userId, {
      title: statusTitles[status] || "تحديث على حجزك",
      body: message.slice(0, 120),
      url: "/account/chat",
      tag: `booking-${bookingId}`,
    });
    delivered = true;
  }

  return NextResponse.json({ booking: updated, delivered, hasAccount: Boolean(existing.userId) });
}
