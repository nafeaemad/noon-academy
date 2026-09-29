import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!newPassword || String(newPassword).length < 6) {
    return NextResponse.json({ error: "كلمة المرور الجديدة لازم تكون 6 حروف على الأقل." }, { status: 400 });
  }

  const rows = await db.select().from(users).where(eq(users.id, Number(session.user.id)));
  const user = rows[0];
  if (!user) return NextResponse.json({ error: "الحساب غير موجود." }, { status: 404 });

  if (user.passwordHash) {
    const valid = await bcrypt.compare(String(currentPassword || ""), user.passwordHash);
    if (!valid) return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  await db.update(users).set({ passwordHash, provider: "credentials" }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
