import { cookies } from "next/headers";
import { validToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { DiscountsManager } from "@/components/admin/discounts-manager";

export default async function AdminDiscountsPage() {
  const store = await cookies();
  if (!validToken(store.get("noon_admin")?.value)) return <AdminLogin />;
  return <DiscountsManager />;
}
