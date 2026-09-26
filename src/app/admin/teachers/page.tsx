import { cookies } from "next/headers";
import { validToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { TeachersManager } from "@/components/admin/teachers-manager";

export default async function AdminTeachersPage() {
  const store = await cookies();
  if (!validToken(store.get("noon_admin")?.value)) return <AdminLogin />;
  return <TeachersManager />;
}
