import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherLedger, teachers } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

/** Recent payment settlements (payouts) across all teachers, for the admin payment-settlement page. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const rows = await db
    .select({
      id: teacherLedger.id,
      amount: teacherLedger.amount,
      note: teacherLedger.note,
      createdAt: teacherLedger.createdAt,
      teacherId: teacherLedger.teacherId,
      teacherNameAr: teachers.nameAr,
      currency: teachers.currency,
    })
    .from(teacherLedger)
    .innerJoin(teachers, eq(teacherLedger.teacherId, teachers.id))
    .where(and(eq(teacherLedger.type, "payout")))
    .orderBy(desc(teacherLedger.createdAt))
    .limit(100);

  return NextResponse.json(rows);
}
