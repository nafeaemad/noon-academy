import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteContent } from "@/db/schema";

export async function GET() {
  try {
    const rows = await db.select().from(siteContent);
    const map: Record<string, { ar: string; en: string }> = {};
    for (const r of rows) map[r.key] = { ar: r.valueAr, en: r.valueEn };
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({});
  }
}
