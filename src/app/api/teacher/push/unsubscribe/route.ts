import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherPushSubscriptions } from "@/db/schema";
import { requireTeacher } from "@/lib/require-teacher";

export async function POST(req: Request) {
  const result = await requireTeacher();
  if ("denied" in result) return result.denied;
  const { endpoint } = await req.json();
  if (endpoint) await db.delete(teacherPushSubscriptions).where(eq(teacherPushSubscriptions.endpoint, String(endpoint)));
  return NextResponse.json({ ok: true });
}
