import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  return NextResponse.json({ student: row?.studentReminderMsg ?? null, teacher: row?.teacherReminderMsg ?? null });
}

/** Body: { student: string|null, teacher: string|null } — empty/null means "use the default message". */
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const clean = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 2000) : null);
  const values = { studentReminderMsg: clean(body.student), teacherReminderMsg: clean(body.teacher) };
  await db.insert(settings).values({ id: 1, ...values }).onConflictDoUpdate({ target: settings.id, set: values });
  return NextResponse.json({ student: values.studentReminderMsg, teacher: values.teacherReminderMsg });
}
