import { NextResponse } from "next/server";
import { and, eq, gt, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import { bookings, teachers } from "@/db/schema";
import { notifyTeacher, notifyUser } from "@/lib/push";
import { sendLessonReminder } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/**
 * Sends the "lesson starts in 15 minutes" reminder (WhatsApp + push) to the student and the teacher.
 * Call it every ~5 minutes from an external cron (e.g. cron-job.org) with
 *   Authorization: Bearer <CRON_SECRET>   (or ?secret=<CRON_SECRET>)
 */
async function run(req: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? url.searchParams.get("secret");
  if (!secret || given !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const soon = new Date(now.getTime() + 15 * 60_000);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || url.origin).replace(/\/$/, "");

  const due = await db
    .select({ booking: bookings, teacher: teachers })
    .from(bookings)
    .innerJoin(teachers, eq(bookings.teacherId, teachers.id))
    .where(and(eq(bookings.status, "confirmed"), isNull(bookings.reminderSentAt), gt(bookings.startsAt, now), lte(bookings.startsAt, soon)));

  let sent = 0;
  for (const { booking, teacher } of due) {
    // Claim first so overlapping cron runs never send twice.
    const [claimed] = await db
      .update(bookings)
      .set({ reminderSentAt: new Date() })
      .where(and(eq(bookings.id, booking.id), isNull(bookings.reminderSentAt)))
      .returning({ id: bookings.id });
    if (!claimed) continue;

    const mins = Math.max(1, Math.round((booking.startsAt.getTime() - now.getTime()) / 60_000));
    const time = booking.startsAt.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", timeZone: booking.timezone || "Africa/Cairo" });
    const studentLink = `${site}/account`;
    const teacherLink = teacher.meetingLink || `${site}/teacher`;

    await Promise.all([
      sendLessonReminder(booking.whatsapp, { name: booking.name, time, link: studentLink }),
      teacher.phone ? sendLessonReminder(teacher.phone, { name: teacher.nameAr, time, link: teacherLink }) : Promise.resolve(),
      booking.userId
        ? notifyUser(booking.userId, {
            title: "حصتك بتبدأ بعد شوية ⏰",
            body: `حصتك ${booking.reference} بتبدأ بعد حوالي ${mins} دقيقة. ادخل من حسابك وانت جاهز.`,
            url: "/account",
            tag: `reminder-${booking.id}`,
          })
        : Promise.resolve(),
      notifyTeacher(teacher.id, {
        title: "حصة بعد ربع ساعة ⏰",
        body: `حصة ${booking.name} (${booking.reference}) بتبدأ بعد حوالي ${mins} دقيقة.`,
        url: "/teacher",
        tag: `reminder-${booking.id}`,
      }),
    ]);
    sent++;
  }

  return NextResponse.json({ checked: due.length, sent });
}

export const GET = run;
export const POST = run;
