import { NextResponse } from "next/server";
import { and, asc, eq, gt, lte } from "drizzle-orm";
import { db } from "@/db";
import { bookings, teachers } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

/** Confirmed lessons starting in the next 24 hours, with both phone numbers for wa.me reminders. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const now = new Date();
  const rows = await db
    .select({
      id: bookings.id,
      reference: bookings.reference,
      studentName: bookings.name,
      studentPhone: bookings.whatsapp,
      startsAt: bookings.startsAt,
      timezone: bookings.timezone,
      teacherName: teachers.nameAr,
      teacherPhone: teachers.phone,
      meetingLink: teachers.meetingLink,
    })
    .from(bookings)
    .leftJoin(teachers, eq(bookings.teacherId, teachers.id))
    .where(and(eq(bookings.status, "confirmed"), gt(bookings.startsAt, new Date(now.getTime() - 30 * 60_000)), lte(bookings.startsAt, new Date(now.getTime() + 24 * 3600_000))))
    .orderBy(asc(bookings.startsAt));
  return NextResponse.json(rows);
}
