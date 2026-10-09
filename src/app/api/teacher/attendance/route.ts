import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherAttendance } from "@/db/schema";
import { requireTeacher } from "@/lib/require-teacher";

export async function GET() {
  const result = await requireTeacher();
  if ("denied" in result) return result.denied;
  const { teacher } = result;
  const rows = await db
    .select()
    .from(teacherAttendance)
    .where(eq(teacherAttendance.teacherId, teacher.id))
    .orderBy(desc(teacherAttendance.date));
  return NextResponse.json(rows);
}
