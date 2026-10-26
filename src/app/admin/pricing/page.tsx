import { cookies } from "next/headers";
import { validToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { PricingManager } from "@/components/admin/pricing-manager";

export default async function AdminPricingPage() {
  const store = await cookies();
  if (!validToken(store.get("noon_admin")?.value)) return <AdminLogin />;
  return <PricingManager />;
}
