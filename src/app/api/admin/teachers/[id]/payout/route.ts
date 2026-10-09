import { NextResponse } from "next/server";
import { db } from "@/db";
import { teacherLedger } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const amount = Number(body.amount);
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "أدخل مبلغًا صحيحًا." }, { status: 400 });
  }
  const [row] = await db
    .insert(teacherLedger)
    .values({
      teacherId: Number(id),
      amount: String(-Math.abs(amount)),
      type: "payout",
      note: body.note || "تم صرف المستحقات للمدرس",
    })
    .returning();
  return NextResponse.json(row);
}
