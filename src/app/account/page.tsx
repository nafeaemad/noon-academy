import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountDashboard } from "@/components/account-dashboard";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");
  return <AccountDashboard user={{ name: session.user.name || "", email: session.user.email || "" }} />;
}
