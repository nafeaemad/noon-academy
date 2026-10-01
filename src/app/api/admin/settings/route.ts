import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await db.select().from(settings).where(eq(settings.id, 1));
  return NextResponse.json(rows[0] ?? null);
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const values = {
    whatsapp: body.whatsapp || "",
    email: body.email || "",
    responseTimeAr: body.responseTimeAr || "",
    responseTimeEn: body.responseTimeEn || "",
    facebook: body.facebook || null,
    instagram: body.instagram || null,
    teachersVisible: Boolean(body.teachersVisible),
  };
  const [row] = await db
    .insert(settings)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: settings.id, set: values })
    .returning();
  return NextResponse.json(row);
}
