import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userPushSubscriptions } from "@/db/schema";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { endpoint } = await req.json();
  if (endpoint) await db.delete(userPushSubscriptions).where(eq(userPushSubscriptions.endpoint, String(endpoint)));
  return NextResponse.json({ ok: true });
}
