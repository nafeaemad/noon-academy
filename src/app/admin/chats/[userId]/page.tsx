import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { validToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { ChatThread } from "@/components/chat-thread";

export default async function AdminChatThreadPage({ params }: { params: Promise<{ userId: string }> }) {
  const store = await cookies();
  if (!validToken(store.get("noon_admin")?.value)) return <AdminLogin />;
  const { userId } = await params;
  const [person] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, Number(userId)));
  const label = person ? `${person.name} — ${person.email}` : "محادثة";
  return <ChatThread mode="admin" userId={Number(userId)} personLabel={label} />;
}
