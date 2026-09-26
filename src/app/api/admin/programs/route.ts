import { NextResponse } from "next/server";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await db.select().from(programs).orderBy(programs.sortOrder);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const [row] = await db
    .insert(programs)
    .values({
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
    .returning();
  return NextResponse.json(row);
}
