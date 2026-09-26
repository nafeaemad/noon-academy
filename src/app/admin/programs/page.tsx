import { cookies } from "next/headers";
import { validToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { ProgramsManager } from "@/components/admin/programs-manager";

export default async function AdminProgramsPage() {
  const store = await cookies();
  if (!validToken(store.get("noon_admin")?.value)) return <AdminLogin />;
  return <ProgramsManager />;
}
