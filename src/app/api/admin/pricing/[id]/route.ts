import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pricingItems } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { pricingValues } from "@/lib/pricing-body";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const v = pricingValues(await req.json());
  if (!v.titleAr || !v.titleEn) return NextResponse.json({ error: "الاسم بالعربي والإنجليزي مطلوب." }, { status: 400 });
  const [row] = await db.update(pricingItems).set(v).where(eq(pricingItems.id, Number(id))).returning();
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  await db.delete(pricingItems).where(eq(pricingItems.id, Number(id)));
  return NextResponse.json({ ok: true });
}
