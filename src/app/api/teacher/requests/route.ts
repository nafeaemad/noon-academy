import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherRequests, bookings } from "@/db/schema";
import { requireTeacher } from "@/lib/require-teacher";
import { notifyAdmins } from "@/lib/push";

export async function GET() {
  const result = await requireTeacher();
  if ("denied" in result) return result.denied;
  const { teacher } = result;
  const rows = await db
    .select()
    .from(teacherRequests)
    .where(eq(teacherRequests.teacherId, teacher.id))
    .orderBy(desc(teacherRequests.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const result = await requireTeacher();
  if ("denied" in result) return result.denied;
  const { teacher } = result;
  const body = await req.json();

  const type = body.type === "cancel_lesson" ? "cancel_lesson" : "leave";
  const reason = String(body.reason || "").trim();
  if (!reason) {
    return NextResponse.json({ error: "من فضلك اكتب سبب الطلب." }, { status: 400 });
  }

  let bookingId: number | null = null;
  if (type === "cancel_lesson") {
    bookingId = body.bookingId ? Number(body.bookingId) : null;
    if (!bookingId) {
      return NextResponse.json({ error: "اختار الحصة المراد إلغاؤها." }, { status: 400 });
    }
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    if (!booking || booking.teacherId !== teacher.id) {
      return NextResponse.json({ error: "الحصة غير موجودة." }, { status: 404 });
    }
  }

  const [row] = await db
    .insert(teacherRequests)
    .values({ teacherId: teacher.id, type, bookingId, reason })
    .returning();

  await notifyAdmins({
    title: type === "leave" ? "طلب إجازة جديد من معلم" : "طلب إلغاء حصة من معلم",
    body: `${teacher.nameAr}: ${reason}`,
    url: "/admin/teacher-requests",
    tag: `teacher-request-${row.id}`,
  });

  return NextResponse.json(row);
}
