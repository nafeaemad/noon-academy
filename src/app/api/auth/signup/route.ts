import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!name || !email || !password) {
    return NextResponse.json({ error: "من فضلك املأ الاسم والبريد وكلمة المرور." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "كلمة المرور لازم تكون 6 حروف على الأقل." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "البريد الإلكتروني غير صحيح." }, { status: 400 });
  }

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing[0]) {
    return NextResponse.json({ error: "يوجد حساب بالفعل بهذا البريد الإلكتروني." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email, passwordHash, provider: "credentials" });
  return NextResponse.json({ ok: true });
}
