import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const [row] = await db
    .update(teachers)
    .set({ approved: true, active: true, availabilityAr: "متاح الآن", availabilityEn: "Available now" })
    .where(eq(teachers.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "المدرس غير موجود." }, { status: 404 });
  const { passwordHash: _passwordHash, ...safe } = row;
  return NextResponse.json(safe);
}
