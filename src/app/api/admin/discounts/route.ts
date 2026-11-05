import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { discounts } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { discountValues } from "@/lib/discount-body";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await db.select().from(discounts).orderBy(asc(discounts.sort), asc(discounts.id)));
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const v = discountValues(await req.json());
  if (v.scope === "selected" && !v.targets!.programs.length && !v.targets!.plans.length && !v.targets!.items.length) {
    return NextResponse.json({ error: "اختار برنامج أو خطة واحدة على الأقل، أو خلّي الخصم على الكل." }, { status: 400 });
  }
  if (!(Number(v.value) > 0)) return NextResponse.json({ error: "اكتب قيمة الخصم." }, { status: 400 });
  const [row] = await db.insert(discounts).values(v).returning();
  return NextResponse.json(row);
}
