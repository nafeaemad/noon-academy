import { NextResponse } from "next/server";
import { asc, eq, and, ne } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { notifyAdmins } from "@/lib/push";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  const rows = await db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(asc(chatMessages.createdAt));

  // Mark admin messages as seen now that the user opened the thread.
  await db
    .update(chatMessages)
    .set({ readByUser: true })
    .where(and(eq(chatMessages.userId, userId), eq(chatMessages.senderType, "admin"), ne(chatMessages.readByUser, true)));

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  const { body } = await req.json();
  const text = String(body || "").trim().slice(0, 2000);
  if (!text) return NextResponse.json({ error: "الرسالة فارغة." }, { status: 400 });

  const [row] = await db
    .insert(chatMessages)
    .values({ userId, senderType: "user", body: text, readByUser: true, readByAdmin: false })
    .returning();

  await notifyAdmins({
    title: "رسالة شات جديدة 💬",
    body: `${session.user.name || session.user.email}: ${text.slice(0, 80)}`,
    url: `/admin/chats/${userId}`,
    tag: `chat-${userId}`,
  });

  return NextResponse.json(row);
}
