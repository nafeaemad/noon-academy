import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteContent } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await db.select().from(siteContent);
  const map: Record<string, { ar: string; en: string }> = {};
  for (const r of rows) map[r.key] = { ar: r.valueAr, en: r.valueEn };
  return NextResponse.json(map);
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const key = String(body.key || "").trim();
  if (!key) return NextResponse.json({ error: "missing key" }, { status: 400 });
  const values = { valueAr: String(body.ar ?? ""), valueEn: String(body.en ?? "") };
  const [row] = await db
    .insert(siteContent)
    .values({ key, ...values })
    .onConflictDoUpdate({ target: siteContent.key, set: values })
    .returning();
  return NextResponse.json(row);
}
