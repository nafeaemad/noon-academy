import { redirect } from "next/navigation";
import { getTeacherFromCookie } from "@/lib/require-teacher";
import { TeacherDashboard } from "@/components/teacher-dashboard";

export const dynamic = "force-dynamic";

export default async function TeacherPortalPage() {
  const teacher = await getTeacherFromCookie();
  if (!teacher) redirect("/teacher-login");
  if (!teacher.approved) {
    return (
      <main className="page-content">
        <div className="container" style={{ maxWidth: 600, textAlign: "center" }}>
          <h1>حسابك بانتظار الموافقة</h1>
          <p>هنفعّل حسابك بعد مراجعة الإدارة، جرّب تاني بعد شوية.</p>
        </div>
      </main>
    );
  }
  return <TeacherDashboard />;
}
