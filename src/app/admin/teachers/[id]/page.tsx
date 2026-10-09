import { cookies } from "next/headers";
import { validToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { TeacherPayrollManager } from "@/components/admin/teacher-payroll-manager";

export default async function AdminTeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const store = await cookies();
  if (!validToken(store.get("noon_admin")?.value)) return <AdminLogin />;
  const { id } = await params;
  return <TeacherPayrollManager teacherId={Number(id)} />;
}
