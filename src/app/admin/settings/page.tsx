import { cookies } from "next/headers";
import { validToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { SettingsManager } from "@/components/admin/settings-manager";

export default async function AdminSettingsPage() {
  const store = await cookies();
  if (!validToken(store.get("noon_admin")?.value)) return <AdminLogin />;
  return <SettingsManager />;
}
