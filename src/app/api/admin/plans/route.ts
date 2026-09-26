import { NextResponse } from "next/server";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await db.select().from(plans);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const [row] = await db
    .insert(plans)
    .values({
      nameAr: body.nameAr,
      nameEn: body.nameEn,
      lessonCount: Number(body.lessonCount) || 0,
      duration: Number(body.duration) || 30,
      price: String(body.price ?? "0"),
      currency: body.currency || "USD",
      active: Boolean(body.active),
    })
    .returning();
  return NextResponse.json(row);
}
