import { cookies } from "next/headers";
import { count, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, reviews, teacherRequests } from "@/db/schema";
import { validToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { PushToggle } from "@/components/admin/push-toggle";

export const dynamic = "force-dynamic";


export default async function AdminPage() {
  const store = await cookies();
  if (!validToken(store.get("noon_admin")?.value)) return <AdminLogin />;

  const [[bookingCount], [pendingCount], [studentCount], [lessonCount], [pendingRequests]] = await Promise.all([
    db.select({ value: count() }).from(bookings).where(ne(bookings.status, "cancelled")),
    db.select({ value: count() }).from(reviews).where(eq(reviews.status, "pending")),
    db
      .select({ value: sql<number>`count(distinct ${bookings.email})` })
      .from(bookings)
      .where(inArray(bookings.status, ["confirmed", "completed"])),
    db.select({ value: count() }).from(bookings).where(eq(bookings.status, "completed")),
    db.select({ value: count() }).from(teacherRequests).where(eq(teacherRequests.status, "pending")),
  ]);

  const stats: [string, number][] = [
    ["الحجوزات / Bookings", bookingCount.value],
    ["الطلاب / Learners", studentCount.value],
    ["الحصص المكتملة / Completed", lessonCount.value],
    ["تقييمات تنتظر المراجعة / Pending reviews", pendingCount.value],
    ["طلبات معلمين معلّقة / Pending teacher requests", pendingRequests.value],
  ];

  return (
    <main className="admin-page">
      <div className="container">
        <span className="section-label">NOON ADMIN</span>
        <h1>لوحة إدارة الأكاديمية</h1>
        <p>مؤشرات حقيقية مباشرة من قاعدة البيانات. لا تشمل أي بيانات تجريبية.</p>
        <div className="admin-stats">
          {stats.map(([x, n]) => (
            <div key={x}>
              <strong>{String(n)}</strong>
              <span>{x}</span>
            </div>
          ))}
        </div>
        <PushToggle />
      </div>
    </main>
  );
}
