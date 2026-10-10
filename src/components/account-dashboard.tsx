"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Calendar, MessageCircle, Video, GraduationCap, Printer } from "lucide-react";
import { useLanguage } from "./language-provider";
import { PageHero } from "./page-hero";

type Booking = {
  id: number;
  reference: string;
  program: string;
  startsAt: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  teacherNameAr: string | null;
  teacherNameEn: string | null;
  meetingLink: string | null;
};

type LessonTx = { id: number; delta: number; reason: string; createdAt: string };

const statusLabelAr: Record<string, string> = { pending: "قيد الانتظار", confirmed: "مؤكد", cancelled: "ملغي", completed: "مكتمل" };
const statusLabelEn: Record<string, string> = { pending: "Pending", confirmed: "Confirmed", cancelled: "Cancelled", completed: "Completed" };

export function AccountDashboard({ user }: { user: { name: string; email: string } }) {
  const { isArabic } = useLanguage();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [lessonBalance, setLessonBalance] = useState<number | null>(null);
  const [lessonTx, setLessonTx] = useState<LessonTx[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account/bookings")
      .then((r) => r.json())
      .then((data) => {
        setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
        setLessonBalance(typeof data?.lessonBalance === "number" ? data.lessonBalance : 0);
      });
    fetch("/api/account/lessons")
      .then((r) => r.json())
      .then((rows) => setLessonTx(Array.isArray(rows) ? rows : []));
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
          <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <button className="btn-mini" onClick={() => window.print()}>
              <Printer size={14} /> {isArabic ? "طباعة التقرير PDF" : "Print report as PDF"}
            </button>
          </div>
          <div className="print-only" style={{ marginBottom: 16 }}>
            <h1 style={{ margin: 0 }}>{isArabic ? "تقرير الطالب" : "Student report"}: {user.name}</h1>
            <p style={{ color: "#555" }}>
              {isArabic ? "تاريخ التقرير" : "Report date"}: {new Date().toLocaleDateString(isArabic ? "ar-EG" : "en-US")}
            </p>
          </div>
          {lessonBalance !== null && (
            <div className="admin-panel" style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <GraduationCap size={28} color="var(--green)" />
              <div>
                <strong style={{ fontSize: 22 }}>{lessonBalance}</strong>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--muted)" }}>
                  {isArabic ? "رصيدك من الحصص المتبقية" : "Your remaining lesson balance"}
                </p>
              </div>
            </div>
          )}
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
                      <th>{isArabic ? "المدرس" : "Teacher"}</th>
                      <th>{isArabic ? "الحالة" : "Status"}</th>
                      <th>{isArabic ? "الحصة" : "Join"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td>{b.reference}</td>
                        <td>{b.program}</td>
                        <td>{new Date(b.startsAt).toLocaleString(isArabic ? "ar-EG" : "en-US")}</td>
                        <td>{(isArabic ? b.teacherNameAr : b.teacherNameEn) || "—"}</td>
                        <td>
                          <span className={`pill-status pill-${b.status}`}>{isArabic ? statusLabelAr[b.status] : statusLabelEn[b.status]}</span>
                        </td>
                        <td>
                          {b.status === "confirmed" && b.meetingLink ? (
                            <a href={b.meetingLink} target="_blank" rel="noreferrer" className="text-link">
                              <Video size={14} /> {isArabic ? "دخول الحصة" : "Join"}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {lessonTx.length > 0 && (
            <div className="admin-panel">
              <div className="admin-toolbar" style={{ marginBottom: 10 }}>
                <strong style={{ fontSize: 15 }}>
                  <GraduationCap size={16} style={{ verticalAlign: "-3px", marginInlineEnd: 6 }} />
                  {isArabic ? "سجل رصيد الحصص" : "Lesson balance history"}
                </strong>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{isArabic ? "التاريخ" : "Date"}</th>
                      <th>{isArabic ? "السبب" : "Reason"}</th>
                      <th>{isArabic ? "عدد الحصص" : "Lessons"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessonTx.map((t) => (
                      <tr key={t.id}>
                        <td>{new Date(t.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US")}</td>
                        <td>{t.reason}</td>
                        <td style={{ color: t.delta < 0 ? "#9d2920" : "#1e6549" }}>{t.delta > 0 ? `+${t.delta}` : t.delta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <form className="admin-panel no-print" onSubmit={changePassword} style={{ marginTop: 20 }}>
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

          <Link href="/account/chat" className="button button-primary no-print" style={{ marginTop: 20 }}>
            <MessageCircle size={16} /> {isArabic ? "الشات المباشر مع الأكاديمية" : "Live chat with the academy"}
          </Link>

          <button className="button button-outline no-print" style={{ marginTop: 12 }} onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut size={16} /> {isArabic ? "تسجيل الخروج" : "Log out"}
          </button>
        </div>
      </section>
    </main>
  );
}
