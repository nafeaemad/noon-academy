import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherAttendance } from "@/db/schema";
import { requireTeacher } from "@/lib/require-teacher";

function todayStr() {
  // Africa/Cairo-friendly date string; falls back to UTC date if Intl unsupported.
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export async function POST(req: Request) {
  const result = await requireTeacher();
  if ("denied" in result) return result.denied;
  const { teacher } = result;
  const body = await req.json().catch(() => ({}));
  const status = ["present", "absent", "excused"].includes(body.status) ? body.status : "present";
  const date = todayStr();

  const [existing] = await db
    .select()
    .from(teacherAttendance)
    .where(and(eq(teacherAttendance.teacherId, teacher.id), eq(teacherAttendance.date, date)));

  if (existing) {
    const [row] = await db
      .update(teacherAttendance)
      .set({ status, note: body.note || null })
      .where(eq(teacherAttendance.id, existing.id))
      .returning();
    return NextResponse.json(row);
  }

  const [row] = await db
    .insert(teacherAttendance)
    .values({ teacherId: teacher.id, date, status, note: body.note || null })
    .returning();
  return NextResponse.json(row);
}
