import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherRequests } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { applyRateChange } from "@/lib/teacher-rate-changes";

/** Lets the admin manually activate an approved rate-change request that was left for later. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const requestId = Number(id);

  const [request] = await db.select().from(teacherRequests).where(eq(teacherRequests.id, requestId));
  if (!request) return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
  if (request.type !== "rate_change" || request.status !== "approved") {
    return NextResponse.json({ error: "الطلب ده مش طلب تغيير سعر موافق عليه." }, { status: 400 });
  }
  if (request.applied) {
    return NextResponse.json({ error: "السعر الجديد مفعّل بالفعل." }, { status: 409 });
  }

  const updated = await applyRateChange(requestId);
  return NextResponse.json(updated);
}
