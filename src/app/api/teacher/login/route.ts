import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { TEACHER_COOKIE, buildCookieValue } from "@/lib/teacher-auth";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "من فضلك أدخل البريد الإلكتروني وكلمة المرور." }, { status: 400 });
  }

  const [teacher] = await db.select().from(teachers).where(eq(teachers.email, email));
  if (!teacher || !teacher.passwordHash) {
    return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, teacher.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." }, { status: 401 });
  }
  if (!teacher.approved) {
    return NextResponse.json({ error: "حسابك لسه بينتظر موافقة الإدارة، هيتفعّل قريبًا." }, { status: 403 });
  }

  const store = await cookies();
  store.set(TEACHER_COOKIE, buildCookieValue(teacher.id, teacher.passwordHash), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
