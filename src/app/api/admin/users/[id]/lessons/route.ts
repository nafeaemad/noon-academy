import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, lessonTransactions } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { notifyUser } from "@/lib/push";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const rows = await db
    .select()
    .from(lessonTransactions)
    .where(eq(lessonTransactions.userId, Number(id)))
    .orderBy(desc(lessonTransactions.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const delta = Number(body.delta);
  if (!delta || !Number.isFinite(delta)) {
    return NextResponse.json({ error: "أدخل عدد حصص صحيح (موجب للإضافة، سالب للخصم)." }, { status: 400 });
  }
  const reason = String(body.reason || "").trim() || (delta > 0 ? "إضافة باقة حصص" : "خصم يدوي");

  const [user] = await db.select().from(users).where(eq(users.id, Number(id)));
  if (!user) return NextResponse.json({ error: "المستخدم غير موجود." }, { status: 404 });

  const [updated] = await db
    .update(users)
    .set({ lessonBalance: sql`${users.lessonBalance} + ${delta}` })
    .where(eq(users.id, Number(id)))
    .returning();

  await db.insert(lessonTransactions).values({ userId: Number(id), delta, reason });

  await notifyUser(Number(id), {
    title: delta > 0 ? "تم إضافة رصيد حصص لحسابك 🎉" : "تم تعديل رصيد حصصك",
    body: `${reason} — رصيدك الحالي: ${updated.lessonBalance} حصة.`,
    url: "/account",
    tag: `lesson-balance-${id}`,
  });

  return NextResponse.json({ lessonBalance: updated.lessonBalance });
}
