import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherAttendance } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const rows = await db
    .select()
    .from(teacherAttendance)
    .where(eq(teacherAttendance.teacherId, Number(id)))
    .orderBy(desc(teacherAttendance.date));
  return NextResponse.json(rows);
}
