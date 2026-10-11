import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { teacherLedger, teachers } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { notifyTeacher } from "@/lib/push";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const teacherId = Number(id);
  const body = await req.json();
  const amount = Number(body.amount);
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "أدخل مبلغًا صحيحًا." }, { status: 400 });
  }

  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, teacherId));
  if (!teacher) return NextResponse.json({ error: "المدرس غير موجود." }, { status: 404 });

  const [row] = await db
    .insert(teacherLedger)
    .values({
      teacherId,
      amount: String(-Math.abs(amount)),
      type: "payout",
      note: body.note || "تم صرف المستحقات للمدرس",
    })
    .returning();

  const [{ balance }] = await db
    .select({ balance: sql<string>`coalesce(sum(${teacherLedger.amount}), 0)` })
    .from(teacherLedger)
    .where(eq(teacherLedger.teacherId, teacherId));

  await notifyTeacher(teacherId, {
    title: "تم إيداع مبلغ في حسابك 💰",
    body: `تم إيداع ${amount.toFixed(2)} ${teacher.currency} في حسابك${body.note ? ` — ${body.note}` : ""}. رصيدك الحالي: ${Number(balance).toFixed(2)} ${teacher.currency}.`,
    url: "/teacher",
    tag: `teacher-payout-${row.id}`,
  });

  return NextResponse.json({ ...row, balance: Number(balance) });
}
