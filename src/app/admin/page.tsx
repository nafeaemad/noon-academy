import { cookies } from "next/headers";
import Link from "next/link";
import { count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, reviews } from "@/db/schema";
import { validToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";

export const dynamic = "force-dynamic";

const cards = [
  { title: "إدارة الحجوزات والمواعيد", desc: "اعرض كل الحجوزات وغيّر حالتها (مؤكد، مكتمل، ملغي).", href: "/admin/bookings" },
  { title: "إدارة المدرسين", desc: "أضف أو عدّل أو احذف بيانات المدرسين اللي بتظهر في الموقع.", href: "/admin/teachers" },
  { title: "البرامج والخطط والأسعار", desc: "تحكم في البرامج التعليمية وخطط الأسعار.", href: "/admin/programs" },
  { title: "التقييمات والموافقة عليها", desc: "وافق أو ارفض تقييمات الطلاب قبل ظهورها بالموقع.", href: "/admin/reviews" },
  { title: "المقالات", desc: "أضف أو عدّل أو احذف مقالات المدونة.", href: "/admin/posts" },
  { title: "محتوى الصفحات", desc: "عدّل نصوص الصفحة الرئيسية وصفحة عن الأكاديمية.", href: "/admin/content" },
  { title: "التواصل والإشعارات", desc: "رقم الواتساب والإيميل ووقت الرد في كل الموقع.", href: "/admin/settings" },
];

export default async function AdminPage() {
  const store = await cookies();
  if (!validToken(store.get("noon_admin")?.value)) return <AdminLogin />;

  const [[bookingCount], [pendingCount], [studentCount], [lessonCount]] = await Promise.all([
    db.select({ value: count() }).from(bookings),
    db.select({ value: count() }).from(reviews).where(eq(reviews.status, "pending")),
    db.select({ value: sql<number>`count(distinct ${bookings.email})` }).from(bookings),
    db.select({ value: count() }).from(bookings).where(eq(bookings.status, "completed")),
  ]);

  const stats: [string, number][] = [
    ["الحجوزات / Bookings", bookingCount.value],
    ["الطلاب / Learners", studentCount.value],
    ["الحصص المكتملة / Completed", lessonCount.value],
    ["تقييمات تنتظر المراجعة / Pending reviews", pendingCount.value],
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
        <div className="admin-grid">
          {cards.map((c, i) => (
            <Link key={c.href} href={c.href}>
              <article>
                <span>0{i + 1}</span>
                <h2>{c.title}</h2>
                <p>{c.desc}</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
