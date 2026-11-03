import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { discounts } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { discountValues } from "@/lib/discount-body";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const v = discountValues(await req.json());
  if (!(Number(v.value) > 0)) return NextResponse.json({ error: "اكتب قيمة الخصم." }, { status: 400 });
  const [row] = await db.update(discounts).set(v).where(eq(discounts.id, Number(id))).returning();
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  await db.delete(discounts).where(eq(discounts.id, Number(id)));
  return NextResponse.json({ ok: true });
}
