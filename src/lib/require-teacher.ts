import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { TEACHER_COOKIE, parseCookieValue, validTeacherToken } from "@/lib/teacher-auth";

export type TeacherRow = typeof teachers.$inferSelect;

/** Resolves the logged-in teacher from the session cookie, or null if not logged in / invalid. */
export async function getTeacherFromCookie(): Promise<TeacherRow | null> {
  const store = await cookies();
  const parsed = parseCookieValue(store.get(TEACHER_COOKIE)?.value);
  if (!parsed) return null;
  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, parsed.id));
  if (!teacher || !teacher.passwordHash) return null;
  if (!validTeacherToken(teacher.id, teacher.passwordHash, parsed.token)) return null;
  return teacher;
}

/** For API routes: returns the teacher row, or a NextResponse to return immediately if unauthorized. */
export async function requireTeacher(): Promise<{ teacher: TeacherRow } | { denied: NextResponse }> {
  const teacher = await getTeacherFromCookie();
  if (!teacher) return { denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!teacher.approved) return { denied: NextResponse.json({ error: "حسابك لسه بينتظر موافقة الإدارة." }, { status: 403 }) };
  return { teacher };
}
