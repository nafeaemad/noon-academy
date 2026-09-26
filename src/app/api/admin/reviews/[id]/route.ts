import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(reviews)
    .set({ status: body.status })
    .where(eq(reviews.id, Number(id)))
    .returning();
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  await db.delete(reviews).where(eq(reviews.id, Number(id)));
  return NextResponse.json({ ok: true });
}
