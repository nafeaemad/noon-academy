import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { teacherLedger } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const teacherId = Number(id);

  const rows = await db
    .select()
    .from(teacherLedger)
    .where(eq(teacherLedger.teacherId, teacherId))
    .orderBy(desc(teacherLedger.createdAt));

  const [{ balance }] = await db
    .select({ balance: sql<string>`coalesce(sum(${teacherLedger.amount}), 0)` })
    .from(teacherLedger)
    .where(eq(teacherLedger.teacherId, teacherId));

  return NextResponse.json({ rows, balance: Number(balance) });
}
