import { cookies } from "next/headers";
import { validToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { TeacherRequestsManager } from "@/components/admin/teacher-requests-manager";

export default async function AdminTeacherRequestsPage() {
  const store = await cookies();
  if (!validToken(store.get("noon_admin")?.value)) return <AdminLogin />;
  return <TeacherRequestsManager />;
}
