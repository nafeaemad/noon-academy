import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherLedger } from "@/db/schema";
import { requireTeacher } from "@/lib/require-teacher";

export async function GET() {
  const result = await requireTeacher();
  if ("denied" in result) return result.denied;
  const { teacher } = result;
  const rows = await db
    .select()
    .from(teacherLedger)
    .where(eq(teacherLedger.teacherId, teacher.id))
    .orderBy(desc(teacherLedger.createdAt));
  return NextResponse.json(rows);
}
