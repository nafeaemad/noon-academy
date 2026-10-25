import { cookies } from "next/headers";
import { validToken } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  // Logged-out visitors get the login form from the page itself, with no menu.
  if (!validToken(store.get("noon_admin")?.value)) return <>{children}</>;
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">{children}</div>
    </div>
  );
}
