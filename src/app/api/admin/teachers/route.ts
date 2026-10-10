import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await db.select().from(teachers);
  return NextResponse.json(rows.map(({ passwordHash: _passwordHash, ...rest }) => rest));
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();

  if (body.email && !body.password) {
    return NextResponse.json({ error: "لازم تحط كلمة مرور للمدرس عشان يقدر يدخل على حسابه." }, { status: 400 });
  }
  if (body.password && String(body.password).length < 6) {
    return NextResponse.json({ error: "كلمة المرور لازم تكون 6 أحرف على الأقل." }, { status: 400 });
  }

  const passwordHash = body.password ? await bcrypt.hash(String(body.password), 10) : null;

  const [row] = await db
    .insert(teachers)
    .values({
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
      passwordHash,
      meetingLink: body.meetingLink || null,
      ratePerLesson: body.ratePerLesson != null ? String(body.ratePerLesson) : "0",
      approved: true,
    })
    .returning();
  const { passwordHash: _passwordHash, ...safe } = row;
  return NextResponse.json(safe);
}
