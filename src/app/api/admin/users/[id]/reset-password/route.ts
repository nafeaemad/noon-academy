import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const { password } = await req.json();
  if (!password || String(password).length < 6) {
    return NextResponse.json({ error: "كلمة المرور لازم تكون 6 حروف على الأقل." }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(String(password), 10);
  await db.update(users).set({ passwordHash, provider: "credentials" }).where(eq(users.id, Number(id)));
  return NextResponse.json({ ok: true });
}
