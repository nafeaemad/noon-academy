import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { userPushSubscriptions } from "@/db/schema";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sub = await req.json();
    const endpoint = String(sub?.endpoint || "");
    const p256dh = String(sub?.keys?.p256dh || "");
    const auth_ = String(sub?.keys?.auth || "");
    if (!endpoint || !p256dh || !auth_) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });

    await db
      .insert(userPushSubscriptions)
      .values({ userId: Number(session.user.id), endpoint, p256dh, auth: auth_ })
      .onConflictDoUpdate({ target: userPushSubscriptions.endpoint, set: { p256dh, auth: auth_, userId: Number(session.user.id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message.slice(0, 200) : "Server error" }, { status: 500 });
  }
}
