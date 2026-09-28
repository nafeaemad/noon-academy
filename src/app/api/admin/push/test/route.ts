import { NextResponse } from "next/server";
import { notifyAdmins } from "@/lib/push";
import { requireAdmin } from "@/lib/require-admin";

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const result = await notifyAdmins({
    title: "إشعار تجريبي ✅",
    body: "الإشعارات شغالة تمام على هذا الجهاز.",
    url: "/admin",
    tag: "test",
  });
  return NextResponse.json(result);
}
