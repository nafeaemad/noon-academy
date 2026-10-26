import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pricingItems } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(pricingItems).where(eq(pricingItems.active, true)).orderBy(asc(pricingItems.sort), asc(pricingItems.id));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
