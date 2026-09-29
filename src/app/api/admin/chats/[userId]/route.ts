import { NextResponse } from "next/server";
import { asc, eq, and, ne } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages, users } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { notifyUser } from "@/lib/push";

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const userId = Number((await params).userId);

  const [person] = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, userId));
  if (!person) return NextResponse.json({ error: "not found" }, { status: 404 });

  const rows = await db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(asc(chatMessages.createdAt));

  await db
    .update(chatMessages)
    .set({ readByAdmin: true })
    .where(and(eq(chatMessages.userId, userId), eq(chatMessages.senderType, "user"), ne(chatMessages.readByAdmin, true)));

  return NextResponse.json({ user: person, messages: rows });
}

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const userId = Number((await params).userId);

  const { body } = await req.json();
  const text = String(body || "").trim().slice(0, 2000);
  if (!text) return NextResponse.json({ error: "الرسالة فارغة." }, { status: 400 });

  const [row] = await db
    .insert(chatMessages)
    .values({ userId, senderType: "admin", body: text, readByUser: false, readByAdmin: true })
    .returning();

  await notifyUser(userId, {
    title: "رد جديد من أكاديمية نون 💬",
    body: text.slice(0, 100),
    url: "/account/chat",
    tag: "chat-reply",
  });

  return NextResponse.json(row);
}
