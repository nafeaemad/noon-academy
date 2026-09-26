import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(programs)
    .set({
      slug: body.slug,
      titleAr: body.titleAr,
      titleEn: body.titleEn,
      descriptionAr: body.descriptionAr,
      descriptionEn: body.descriptionEn,
      levelAr: body.levelAr,
      levelEn: body.levelEn,
      ageAr: body.ageAr,
      ageEn: body.ageEn,
      duration: Number(body.duration) || 30,
      active: Boolean(body.active),
      sortOrder: Number(body.sortOrder) || 0,
    })
    .where(eq(programs.id, Number(id)))
    .returning();
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  await db.delete(programs).where(eq(programs.id, Number(id)));
  return NextResponse.json({ ok: true });
}
