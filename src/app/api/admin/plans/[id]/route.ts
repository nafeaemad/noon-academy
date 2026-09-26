import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(plans)
    .set({
      nameAr: body.nameAr,
      nameEn: body.nameEn,
      lessonCount: Number(body.lessonCount) || 0,
      duration: Number(body.duration) || 30,
      price: String(body.price ?? "0"),
      currency: body.currency || "USD",
      active: Boolean(body.active),
    })
    .where(eq(plans.id, Number(id)))
    .returning();
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  await db.delete(plans).where(eq(plans.id, Number(id)));
  return NextResponse.json({ ok: true });
}
