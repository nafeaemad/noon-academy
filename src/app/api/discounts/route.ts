import { NextResponse } from "next/server";
import { and, asc, eq, isNull, lte, gte, or } from "drizzle-orm";
import { db } from "@/db";
import { discounts } from "@/db/schema";

export const dynamic = "force-dynamic";

/** Active discounts that are inside their date range (the first one is the one the site uses). */
export async function GET() {
  try {
    const now = new Date();
    const rows = await db
      .select()
      .from(discounts)
      .where(and(eq(discounts.active, true), or(isNull(discounts.startsAt), lte(discounts.startsAt, now)), or(isNull(discounts.endsAt), gte(discounts.endsAt, now))))
      .orderBy(asc(discounts.sort), asc(discounts.id));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
