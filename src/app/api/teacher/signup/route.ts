import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teachers } from "@/db/schema";

export async function POST(req: Request) {
  const body = await req.json();
  const nameAr = String(body.nameAr || "").trim();
  const nameEn = String(body.nameEn || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const specialtyAr = String(body.specialtyAr || "").trim();
  const specialtyEn = String(body.specialtyEn || "").trim();
  const qualificationsAr = String(body.qualificationsAr || "").trim();
  const qualificationsEn = String(body.qualificationsEn || "").trim();
  const meetingLink = String(body.meetingLink || "").trim();

  if (!nameAr || !nameEn || !email || !password) {
    return NextResponse.json({ error: "من فضلك املأ الاسم والبريد الإلكتروني وكلمة المرور." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "كلمة المرور لازم تكون 6 أحرف على الأقل." }, { status: 400 });
  }

  const [existing] = await db.select({ id: teachers.id }).from(teachers).where(eq(teachers.email, email));
  if (existing) {
    return NextResponse.json({ error: "البريد الإلكتروني ده مسجّل بالفعل." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [row] = await db
    .insert(teachers)
    .values({
      nameAr,
      nameEn,
      specialtyAr: specialtyAr || nameAr,
      specialtyEn: specialtyEn || nameEn,
      qualificationsAr: qualificationsAr || "—",
      qualificationsEn: qualificationsEn || "—",
      languages: Array.isArray(body.languages) ? body.languages : [],
      yearsExperience: body.yearsExperience ? Number(body.yearsExperience) : null,
      email,
      passwordHash,
      meetingLink: meetingLink || null,
      approved: false,
      active: false,
      availabilityAr: "بانتظار الموافقة",
      availabilityEn: "Pending approval",
    })
    .returning();

  return NextResponse.json({ ok: true, id: row.id, message: "تم إنشاء حسابك، هيتم تفعيله بعد موافقة الإدارة." });
}
