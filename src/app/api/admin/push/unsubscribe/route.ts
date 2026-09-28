import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { endpoint } = await req.json();
  if (endpoint) await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, String(endpoint)));
  return NextResponse.json({ ok: true });
}
