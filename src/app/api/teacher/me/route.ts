import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { teacherLedger, teachers } from "@/db/schema";
import { requireTeacher } from "@/lib/require-teacher";
import { TEACHER_COOKIE, buildCookieValue } from "@/lib/teacher-auth";
import { applyDueRateChanges } from "@/lib/teacher-rate-changes";

export async function GET() {
  const result = await requireTeacher();
  if ("denied" in result) return result.denied;
  await applyDueRateChanges();
  // Re-fetch in case this teacher's own rate was just activated above.
  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, result.teacher.id));

  const [{ balance }] = await db
    .select({ balance: sql<string>`coalesce(sum(${teacherLedger.amount}), 0)` })
    .from(teacherLedger)
    .where(eq(teacherLedger.teacherId, teacher.id));

  const { passwordHash: _passwordHash, ...safe } = teacher;
  return NextResponse.json({ ...safe, balance: Number(balance) });
}

export async function PATCH(req: Request) {
  const result = await requireTeacher();
  if ("denied" in result) return result.denied;
  const { teacher } = result;
  const body = await req.json();

  const update: Partial<typeof teachers.$inferInsert> = {};
  if (typeof body.meetingLink === "string") update.meetingLink = body.meetingLink.trim() || null;
  if (typeof body.specialtyAr === "string") update.specialtyAr = body.specialtyAr.trim();
  if (typeof body.specialtyEn === "string") update.specialtyEn = body.specialtyEn.trim();
  if (typeof body.qualificationsAr === "string") update.qualificationsAr = body.qualificationsAr.trim();
  if (typeof body.qualificationsEn === "string") update.qualificationsEn = body.qualificationsEn.trim();
  if (typeof body.yearsExperience !== "undefined") update.yearsExperience = body.yearsExperience ? Number(body.yearsExperience) : null;
  if (typeof body.imageUrl === "string") update.imageUrl = body.imageUrl.trim() || null;
  if (Array.isArray(body.languages)) update.languages = body.languages;
  if (typeof body.phone === "string") update.phone = body.phone.trim() || null;

  if (typeof body.email === "string" && body.email.trim()) {
    const email = body.email.trim().toLowerCase();
    if (email !== teacher.email) {
      const [existing] = await db
        .select({ id: teachers.id })
        .from(teachers)
        .where(and(eq(teachers.email, email), ne(teachers.id, teacher.id)));
      if (existing) {
        return NextResponse.json({ error: "البريد الإلكتروني ده مستخدم بالفعل." }, { status: 409 });
      }
      update.email = email;
    }
  }

  if (typeof body.excused === "boolean") {
    update.excused = body.excused;
    update.excuseReason = body.excused ? String(body.excuseReason || "").trim() || null : null;
    update.availabilityAr = body.excused ? "معتذر حاليًا" : "متاح الآن";
    update.availabilityEn = body.excused ? "Currently excused" : "Available now";
  }

  if (body.newPassword) {
    const newPassword = String(body.newPassword);
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "كلمة المرور الجديدة لازم تكون 6 أحرف على الأقل." }, { status: 400 });
    }
    const current = String(body.currentPassword || "");
    const ok = teacher.passwordHash ? await bcrypt.compare(current, teacher.passwordHash) : false;
    if (!ok) {
      return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة." }, { status: 400 });
    }
    update.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const [row] = await db.update(teachers).set(update).where(eq(teachers.id, teacher.id)).returning();

  if (update.passwordHash && row.passwordHash) {
    const store = await cookies();
    store.set(TEACHER_COOKIE, buildCookieValue(row.id, row.passwordHash), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  const { passwordHash: _passwordHash, ...safe } = row;
  return NextResponse.json(safe);
}
