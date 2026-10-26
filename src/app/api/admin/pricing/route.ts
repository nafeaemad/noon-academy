import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { pricingItems } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { pricingValues } from "@/lib/pricing-body";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await db.select().from(pricingItems).orderBy(asc(pricingItems.sort), asc(pricingItems.id)));
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const v = pricingValues(await req.json());
  if (!v.titleAr || !v.titleEn) return NextResponse.json({ error: "الاسم بالعربي والإنجليزي مطلوب." }, { status: 400 });
  const [row] = await db.insert(pricingItems).values(v).returning();
  return NextResponse.json(row);
}
