import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages, users } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      lastMessage: sql<string>`(select body from chat_messages where user_id = ${users.id} order by created_at desc limit 1)`,
      lastMessageAt: sql<string>`(select created_at from chat_messages where user_id = ${users.id} order by created_at desc limit 1)`,
      unread: sql<number>`(select count(*) from chat_messages where user_id = ${users.id} and sender_type = 'user' and read_by_admin = false)`,
    })
    .from(chatMessages)
    .innerJoin(users, eq(chatMessages.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(sql`(select created_at from chat_messages where user_id = ${users.id} order by created_at desc limit 1)`));

  return NextResponse.json(rows);
}
