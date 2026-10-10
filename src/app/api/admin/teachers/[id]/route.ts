import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();

  if (body.password && String(body.password).length < 6) {
    return NextResponse.json({ error: "كلمة المرور لازم تكون 6 أحرف على الأقل." }, { status: 400 });
  }

  const update: Partial<typeof teachers.$inferInsert> = {
    nameAr: body.nameAr,
    nameEn: body.nameEn,
    specialtyAr: body.specialtyAr,
    specialtyEn: body.specialtyEn,
    qualificationsAr: body.qualificationsAr,
    qualificationsEn: body.qualificationsEn,
    languages: Array.isArray(body.languages)
      ? body.languages
      : String(body.languages || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
    yearsExperience: body.yearsExperience ? Number(body.yearsExperience) : null,
    imageUrl: body.imageUrl || null,
    active: Boolean(body.active),
    availabilityAr: body.availabilityAr || "متاح الآن",
    availabilityEn: body.availabilityEn || "Available now",
    email: body.email ? String(body.email).trim().toLowerCase() : null,
    phone: body.phone || null,
    meetingLink: body.meetingLink || null,
    ratePerLesson: body.ratePerLesson != null ? String(body.ratePerLesson) : "0",
    excused: Boolean(body.excused),
    excuseReason: body.excused ? body.excuseReason || null : null,
  };
  if (body.password) {
    update.passwordHash = await bcrypt.hash(String(body.password), 10);
  }

  const [row] = await db.update(teachers).set(update).where(eq(teachers.id, Number(id))).returning();
  const { passwordHash: _passwordHash, ...safe } = row;
  return NextResponse.json(safe);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  await db.delete(teachers).where(eq(teachers.id, Number(id)));
  return NextResponse.json({ ok: true });
}
