import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ChatThread } from "@/components/chat-thread";

export default async function AccountChatPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/chat");
  return <ChatThread mode="user" />;
}
