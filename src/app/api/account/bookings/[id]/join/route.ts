import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { bookings, teachers } from "@/db/schema";
import { completeLesson } from "@/lib/complete-lesson";
import { joinState } from "@/lib/lesson-window";

/**
 * The student pressed "Join". Counts the lesson (teacher credited, one lesson taken off the
 * student's balance) the first time, then hands back the meeting link. Pressing Join again to
 * re-enter the same lesson returns the link without charging anything a second time.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);
  const { id } = await params;

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, Number(id)));
  if (!booking || booking.userId !== userId) {
    return NextResponse.json({ error: "الحجز غير موجود." }, { status: 404 });
  }
  if (booking.status === "cancelled" || booking.status === "pending") {
    return NextResponse.json({ error: "الحصة دي لسه ماتأكدتش من الإدارة." }, { status: 400 });
  }
  if (!booking.teacherId) {
    return NextResponse.json({ error: "لسه ماتحددش مدرس للحصة دي." }, { status: 400 });
  }

  const state = joinState(booking.startsAt, booking.duration);
  if (state === "early") {
    return NextResponse.json({ error: "الدخول بيفتح قبل الموعد بربع ساعة. ارجع في الوقت ده." }, { status: 400 });
  }
  if (state === "closed") {
    return NextResponse.json({ error: "وقت الحصة انتهى." }, { status: 400 });
  }

  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, booking.teacherId));
  if (!teacher?.meetingLink) {
    // Nothing is charged until the student actually has somewhere to go.
    return NextResponse.json({ error: "المدرس لسه ماضافش لينك الحصة. كلّم الإدارة من الشات." }, { status: 400 });
  }

  let charged = false;
  let lessonBalance: number | null = null;
  if (!booking.creditedAt) {
    const result = await completeLesson(booking.id, "student_join");
    if (result.ok) {
      charged = true;
      lessonBalance = result.lessonBalance;
    } else if (result.status !== 409) {
      // 409 means someone (admin or a double click) already counted it; anything else is a real failure.
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
  }

  return NextResponse.json({ meetingLink: teacher.meetingLink, charged, lessonBalance });
}
