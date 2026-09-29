"use client";

import { useEffect, useState, type FormEvent } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Calendar } from "lucide-react";
import { useLanguage } from "./language-provider";
import { PageHero } from "./page-hero";

type Booking = {
  id: number;
  reference: string;
  program: string;
  startsAt: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
};

const statusLabelAr: Record<string, string> = { pending: "قيد الانتظار", confirmed: "مؤكد", cancelled: "ملغي", completed: "مكتمل" };
const statusLabelEn: Record<string, string> = { pending: "Pending", confirmed: "Confirmed", cancelled: "Cancelled", completed: "Completed" };

export function AccountDashboard({ user }: { user: { name: string; email: string } }) {
  const { isArabic } = useLanguage();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account/bookings")
      .then((r) => r.json())
      .then((rows) => setBookings(Array.isArray(rows) ? rows : []));
  }, []);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setStatus("");
    setError("");
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || (isArabic ? "حدث خطأ" : "Something went wrong"));
      return;
    }
    setStatus(isArabic ? "تم تغيير كلمة المرور ✓" : "Password updated ✓");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <main>
      <PageHero
        contentKey="account-hero"
        label={{ ar: "حسابي", en: "MY ACCOUNT" }}
        title={{ ar: `أهلًا، ${user.name}`, en: `Welcome, ${user.name}` }}
        description={{ ar: user.email, en: user.email }}
      />
      <section className="page-content">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="admin-panel">
            <div className="admin-toolbar" style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: 15 }}>
                <Calendar size={16} style={{ verticalAlign: "-3px", marginInlineEnd: 6 }} />
                {isArabic ? "حجوزاتي" : "My bookings"}
              </strong>
            </div>
            {bookings === null ? (
              <p className="form-note">{isArabic ? "جاري التحميل..." : "Loading..."}</p>
            ) : bookings.length === 0 ? (
              <p className="form-note">{isArabic ? "لا توجد حجوزات بعد." : "No bookings yet."}</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{isArabic ? "المرجع" : "Reference"}</th>
                      <th>{isArabic ? "البرنامج" : "Program"}</th>
                      <th>{isArabic ? "الموعد" : "Date"}</th>
                      <th>{isArabic ? "الحالة" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td>{b.reference}</td>
                        <td>{b.program}</td>
                        <td>{new Date(b.startsAt).toLocaleString(isArabic ? "ar-EG" : "en-US")}</td>
                        <td>
                          <span className={`pill-status pill-${b.status}`}>{isArabic ? statusLabelAr[b.status] : statusLabelEn[b.status]}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <form className="admin-panel" onSubmit={changePassword} style={{ marginTop: 20 }}>
            <div className="admin-toolbar" style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: 15 }}>{isArabic ? "تغيير كلمة المرور" : "Change password"}</strong>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>{isArabic ? "كلمة المرور الحالية" : "Current password"}</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="field">
                <label>{isArabic ? "كلمة المرور الجديدة" : "New password"}</label>
                <input type="password" minLength={6} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
            </div>
            {error && <div className="status-message error">{error}</div>}
            <div className="save-bar">
              <button className="button button-primary" type="submit">
                {isArabic ? "حفظ" : "Save"}
              </button>
              {status && <span className="status-message success" style={{ margin: 0 }}>{status}</span>}
            </div>
          </form>

          <button className="button button-outline" style={{ marginTop: 20 }} onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut size={16} /> {isArabic ? "تسجيل الخروج" : "Log out"}
          </button>
        </div>
      </section>
    </main>
  );
}
