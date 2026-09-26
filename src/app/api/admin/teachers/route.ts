import { NextResponse } from "next/server";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await db.select().from(teachers);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const [row] = await db
    .insert(teachers)
    .values({
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
    })
    .returning();
  return NextResponse.json(row);
}
