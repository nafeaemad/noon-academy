import { NextResponse } from "next/server";
import { db } from "@/db";
import { teacherPushSubscriptions } from "@/db/schema";
import { requireTeacher } from "@/lib/require-teacher";

export async function POST(req: Request) {
  const result = await requireTeacher();
  if ("denied" in result) return result.denied;
  const { teacher } = result;
  try {
    const sub = await req.json();
    const endpoint = String(sub?.endpoint || "");
    const p256dh = String(sub?.keys?.p256dh || "");
    const auth_ = String(sub?.keys?.auth || "");
    if (!endpoint || !p256dh || !auth_) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });

    await db
      .insert(teacherPushSubscriptions)
      .values({ teacherId: teacher.id, endpoint, p256dh, auth: auth_ })
      .onConflictDoUpdate({ target: teacherPushSubscriptions.endpoint, set: { p256dh, auth: auth_, teacherId: teacher.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message.slice(0, 200) : "Server error" }, { status: 500 });
  }
}
