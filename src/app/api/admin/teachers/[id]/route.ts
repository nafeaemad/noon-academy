import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(teachers)
    .set({
      nameAr: body.nameAr,
      nameEn: body.nameEn,
      specialtyAr: body.specialtyAr,
      specialtyEn: body.specialtyEn,
      qualificationsAr: body.qualificationsAr,
      qualificationsEn: body.qualificationsEn,
      languages: Array.isArray(body.languages)
        ? body.languages
        : String(body.languages || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
      yearsExperience: body.yearsExperience ? Number(body.yearsExperience) : null,
      imageUrl: body.imageUrl || null,
      active: Boolean(body.active),
      availabilityAr: body.availabilityAr || "متاح الآن",
      availabilityEn: body.availabilityEn || "Available now",
    })
    .where(eq(teachers.id, Number(id)))
    .returning();
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  await db.delete(teachers).where(eq(teachers.id, Number(id)));
  return NextResponse.json({ ok: true });
}
