import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherRequests, teachers, bookings } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { applyDueRateChanges } from "@/lib/teacher-rate-changes";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  await applyDueRateChanges();

  const rows = await db
    .select({
      id: teacherRequests.id,
      type: teacherRequests.type,
      reason: teacherRequests.reason,
      status: teacherRequests.status,
      adminNote: teacherRequests.adminNote,
      createdAt: teacherRequests.createdAt,
      resolvedAt: teacherRequests.resolvedAt,
      teacherId: teacherRequests.teacherId,
      teacherNameAr: teachers.nameAr,
      teacherCurrency: teachers.currency,
      bookingId: teacherRequests.bookingId,
      bookingReference: bookings.reference,
      bookingStartsAt: bookings.startsAt,
      requestedRate: teacherRequests.requestedRate,
      autoActivate: teacherRequests.autoActivate,
      effectiveAt: teacherRequests.effectiveAt,
      applied: teacherRequests.applied,
      currentRate: teachers.ratePerLesson,
    })
    .from(teacherRequests)
    .leftJoin(teachers, eq(teacherRequests.teacherId, teachers.id))
    .leftJoin(bookings, eq(teacherRequests.bookingId, bookings.id))
    .orderBy(desc(teacherRequests.createdAt));

  return NextResponse.json(rows);
}
