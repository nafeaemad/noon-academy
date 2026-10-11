"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Save, Video, CalendarCheck, Wallet, Ban, User, Printer, Send } from "lucide-react";
import { TeacherPushOptIn } from "./teacher-push-optin";

type Teacher = {
  id: number;
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  qualificationsAr: string;
  email: string | null;
  phone: string | null;
  meetingLink: string | null;
  excused: boolean;
  excuseReason: string | null;
  ratePerLesson: string;
  currency: string;
  balance: number;
};

type Booking = {
  id: number;
  reference: string;
  program: string;
  startsAt: string;
  duration: number;
  name: string;
  whatsapp: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
};

type Attendance = { id: number; date: string; status: string; note: string | null };
type LedgerRow = { id: number; amount: string; type: string; note: string | null; createdAt: string };
type RequestRow = {
  id: number;
  type: "leave" | "cancel_lesson" | "rate_change";
  bookingId: number | null;
  reason: string;
  status: "pending" | "approved" | "rejected";
  adminNote: string | null;
  createdAt: string;
  requestedRate: string | null;
  autoActivate: boolean;
  effectiveAt: string | null;
  applied: boolean;
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  cancelled: "ملغي",
  completed: "مكتمل",
};

const requestTypeLabels: Record<string, string> = {
  leave: "طلب إجازة / اعتذار",
  cancel_lesson: "طلب إلغاء حصة",
  rate_change: "طلب تغيير سعر الحصة",
};
const requestStatusLabels: Record<string, string> = { pending: "قيد المراجعة", approved: "تمت الموافقة", rejected: "مرفوض" };

export function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);

  const [meetingLink, setMeetingLink] = useState("");
  const [excused, setExcused] = useState(false);
  const [excuseReason, setExcuseReason] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwStatus, setPwStatus] = useState("");
  const [pwError, setPwError] = useState("");

  const [reqType, setReqType] = useState<"leave" | "cancel_lesson" | "rate_change">("leave");
  const [reqBookingId, setReqBookingId] = useState("");
  const [reqReason, setReqReason] = useState("");
  const [reqRate, setReqRate] = useState("");
  const [reqStatus, setReqStatus] = useState("");

  function load() {
    fetch("/api/teacher/me").then((r) => r.json()).then((t) => {
      setTeacher(t);
      setMeetingLink(t.meetingLink || "");
      setExcused(Boolean(t.excused));
      setExcuseReason(t.excuseReason || "");
      setEmail(t.email || "");
      setPhone(t.phone || "");
    });
    fetch("/api/teacher/bookings").then((r) => r.json()).then(setBookings);
    fetch("/api/teacher/attendance").then((r) => r.json()).then(setAttendance);
    fetch("/api/teacher/ledger").then((r) => r.json()).then(setLedger);
    fetch("/api/teacher/requests").then((r) => r.json()).then(setRequests);
  }

  useEffect(load, []);

  async function saveProfile() {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/teacher/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ meetingLink, excused, excuseReason, email, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("تم الحفظ ✓");
        load();
      } else {
        setStatus(data.error || "حدث خطأ أثناء الحفظ");
      }
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setPwStatus("");
    setPwError("");
    if (newPassword.length < 6) {
      setPwError("كلمة المرور الجديدة لازم تكون 6 أحرف على الأقل.");
      return;
    }
    const res = await fetch("/api/teacher/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setPwStatus("تم تغيير كلمة المرور ✓");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setPwError(data.error || "حدث خطأ");
    }
  }

  async function checkin(dayStatus: "present" | "absent") {
    await fetch("/api/teacher/attendance/checkin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: dayStatus }),
    });
    load();
  }

  async function submitRequest() {
    setReqStatus("");
    if (!reqReason.trim()) {
      setReqStatus("اكتب سبب الطلب.");
      return;
    }
    if (reqType === "cancel_lesson" && !reqBookingId) {
      setReqStatus("اختار الحصة المراد إلغاؤها.");
      return;
    }
    if (reqType === "rate_change" && (!reqRate || Number(reqRate) <= 0)) {
      setReqStatus("اكتب السعر الجديد المطلوب للحصة.");
      return;
    }
    const res = await fetch("/api/teacher/requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: reqType,
        reason: reqReason,
        bookingId: reqBookingId || undefined,
        requestedRate: reqType === "rate_change" ? reqRate : undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setReqStatus("تم إرسال الطلب للإدارة ✓");
      setReqReason("");
      setReqBookingId("");
      setReqRate("");
      load();
    } else {
      setReqStatus(data.error || "حدث خطأ");
    }
  }

  async function logout() {
    await fetch("/api/teacher/logout", { method: "POST" });
    router.push("/teacher-login");
    router.refresh();
  }

  if (!teacher) {
    return (
      <main className="admin-page">
        <div className="container">جاري التحميل...</div>
      </main>
    );
  }

  const today = attendance[0]?.date === new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(new Date()) ? attendance[0] : null;
  const upcomingBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "pending");

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-toolbar no-print">
          <div>
            <span className="section-label">بوابة المعلمين</span>
            <h1 style={{ margin: "8px 0 0" }}>أهلًا، {teacher.nameAr}</h1>
          </div>
          <div className="admin-actions">
            <button className="btn-mini" onClick={() => window.print()}>
              <Printer size={14} /> طباعة التقرير PDF
            </button>
            <button className="btn-mini danger" onClick={logout}>
              <LogOut size={14} /> تسجيل الخروج
            </button>
          </div>
        </div>

        <div className="print-only" style={{ display: "none", marginBottom: 20 }}>
          <h1 style={{ margin: 0 }}>تقرير المعلم: {teacher.nameAr}</h1>
          <p style={{ color: "#555" }}>تاريخ التقرير: {new Date().toLocaleDateString("ar-EG")}</p>
        </div>

        <div className="admin-stats">
          <div>
            <strong>{teacher.balance.toFixed(2)} {teacher.currency}</strong>
            <span>رصيدك الحالي (قبض)</span>
          </div>
          <div>
            <strong>{Number(teacher.ratePerLesson).toFixed(2)} {teacher.currency}</strong>
            <span>سعر الحصة الواحدة</span>
          </div>
          <div>
            <strong>{bookings.filter((b) => b.status === "completed").length}</strong>
            <span>حصص مكتملة</span>
          </div>
          <div>
            <strong>{bookings.filter((b) => b.status === "confirmed").length}</strong>
            <span>حصص قادمة</span>
          </div>
        </div>

        <div className="no-print">
          <TeacherPushOptIn />
        </div>

        <div className="admin-panel no-print">
          <div className="admin-toolbar" style={{ marginBottom: 10 }}>
            <strong style={{ fontSize: 15 }}>
              <Video size={15} style={{ verticalAlign: "middle", marginLeft: 6 }} /> بياناتك
            </strong>
          </div>
          <div className="form-grid">
            <div className="field">
              <label>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>رقم الموبايل</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="field full">
              <label>لينك الزوم / جوجل ميت الثابت (اللي الطالب بيدخل منه)</label>
              <input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://..." />
            </div>
            <div className="field">
              <label className="toggle-row">
                <input type="checkbox" checked={excused} onChange={(e) => setExcused(e.target.checked)} />
                <Ban size={14} /> أنا معتذر حاليًا
              </label>
            </div>
            {excused && (
              <div className="field full">
                <label>سبب الاعتذار (اختياري)</label>
                <input value={excuseReason} onChange={(e) => setExcuseReason(e.target.value)} />
              </div>
            )}
          </div>
          <div className="save-bar">
            <button className="button button-primary" onClick={saveProfile} disabled={saving}>
              <Save size={16} /> {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            {status && <span className="status-message success" style={{ margin: 0 }}>{status}</span>}
          </div>
        </div>

        <div className="admin-panel no-print">
          <div className="admin-toolbar" style={{ marginBottom: 10 }}>
            <strong style={{ fontSize: 15 }}>
              <User size={15} style={{ verticalAlign: "middle", marginLeft: 6 }} /> تغيير كلمة المرور
            </strong>
          </div>
          <div className="form-grid">
            <div className="field">
              <label>كلمة المرور الحالية</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="field">
              <label>كلمة المرور الجديدة</label>
              <input type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>
          {pwError && <div className="status-message error">{pwError}</div>}
          <div className="save-bar">
            <button className="button button-primary" onClick={changePassword}>
              حفظ كلمة المرور
            </button>
            {pwStatus && <span className="status-message success" style={{ margin: 0 }}>{pwStatus}</span>}
          </div>
        </div>

        <div className="admin-panel no-print">
          <div className="admin-toolbar" style={{ marginBottom: 10 }}>
            <strong style={{ fontSize: 15 }}>
              <Send size={15} style={{ verticalAlign: "middle", marginLeft: 6 }} /> طلب إجازة أو إلغاء حصة
            </strong>
          </div>
          <div className="form-grid">
            <div className="field">
              <label>نوع الطلب</label>
              <select value={reqType} onChange={(e) => setReqType(e.target.value as "leave" | "cancel_lesson" | "rate_change")}>
                <option value="leave">إجازة / اعتذار عام</option>
                <option value="cancel_lesson">إلغاء حصة معينة</option>
                <option value="rate_change">تغيير سعر الحصة (زيادة أو تخفيض)</option>
              </select>
            </div>
            {reqType === "cancel_lesson" && (
              <div className="field">
                <label>الحصة</label>
                <select value={reqBookingId} onChange={(e) => setReqBookingId(e.target.value)}>
                  <option value="">اختار الحصة</option>
                  {upcomingBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {new Date(b.startsAt).toLocaleString("ar-EG")}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {reqType === "rate_change" && (
              <div className="field">
                <label>السعر الجديد المطلوب ({teacher.currency}) — سعرك الحالي {Number(teacher.ratePerLesson).toFixed(2)}</label>
                <input type="number" step="0.01" value={reqRate} onChange={(e) => setReqRate(e.target.value)} />
              </div>
            )}
            <div className="field full">
              <label>سبب الطلب</label>
              <textarea rows={3} value={reqReason} onChange={(e) => setReqReason(e.target.value)} />
            </div>
          </div>
          <div className="save-bar">
            <button className="button button-primary" onClick={submitRequest}>
              إرسال الطلب
            </button>
            {reqStatus && <span className="status-message success" style={{ margin: 0 }}>{reqStatus}</span>}
          </div>
        </div>

        <div className="admin-panel">
          <strong style={{ fontSize: 15 }}>
            <Send size={15} style={{ verticalAlign: "middle", marginLeft: 6 }} /> طلباتي (إجازة / إلغاء حصة / تغيير سعر)
          </strong>
          {requests.length === 0 ? (
            <div className="admin-empty" style={{ marginTop: 14 }}>لسه معملتش أي طلبات.</div>
          ) : (
            <div className="admin-table-wrap" style={{ marginTop: 14 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>النوع</th>
                    <th>السبب</th>
                    <th>الحالة</th>
                    <th>رد الإدارة</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {requestTypeLabels[r.type]}
                        {r.type === "rate_change" && r.requestedRate && (
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                            السعر المطلوب: {Number(r.requestedRate).toFixed(2)} {teacher.currency}
                          </div>
                        )}
                      </td>
                      <td>{r.reason}</td>
                      <td>
                        <span className={`pill-status ${r.status === "approved" ? "pill-approved" : r.status === "rejected" ? "pill-rejected" : "pill-pending"}`}>
                          {requestStatusLabels[r.status]}
                        </span>
                        {r.type === "rate_change" && r.status === "approved" && (
                          <div style={{ fontSize: 12, marginTop: 4 }}>
                            {r.applied
                              ? "✓ السعر مفعّل"
                              : r.autoActivate && r.effectiveAt
                                ? `هيتفعّل ${new Date(r.effectiveAt).toLocaleString("ar-EG")}`
                                : "في انتظار تفعيل الإدارة"}
                          </div>
                        )}
                      </td>
                      <td>{r.adminNote || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-panel">
          <strong style={{ fontSize: 15 }}>
            <Wallet size={15} style={{ verticalAlign: "middle", marginLeft: 6 }} /> سجل المدفوعات المستلمة
          </strong>
          {ledger.filter((l) => l.type === "payout").length === 0 ? (
            <div className="admin-empty" style={{ marginTop: 14 }}>لسه معندكش أي دفعات مستلمة.</div>
          ) : (
            <div className="admin-table-wrap" style={{ marginTop: 14 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>المبلغ</th>
                    <th>ملاحظة</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger
                    .filter((l) => l.type === "payout")
                    .map((l) => (
                      <tr key={l.id}>
                        <td>{new Date(l.createdAt).toLocaleDateString("ar-EG")}</td>
                        <td>{Math.abs(Number(l.amount)).toFixed(2)} {teacher.currency}</td>
                        <td>{l.note || "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-panel">
          <strong style={{ fontSize: 15 }}>
            <CalendarCheck size={15} style={{ verticalAlign: "middle", marginLeft: 6 }} /> الحضور اليومي
          </strong>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "12px 0" }}>
            {today ? `تم تسجيل حضورك النهاردة: ${statusLabels[today.status] || today.status}` : "لسه ماسجلتش حضورك النهاردة."}
          </p>
          <div className="admin-actions no-print">
            <button className="btn-mini primary" onClick={() => checkin("present")}>تسجيل حضور</button>
            <button className="btn-mini danger" onClick={() => checkin("absent")}>تسجيل غياب</button>
          </div>
          <div className="admin-table-wrap" style={{ marginTop: 14 }}>
            {attendance.length === 0 ? (
              <div className="admin-empty">لا يوجد سجل حضور بعد.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>اليوم</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td>{statusLabels[a.status] || a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <strong style={{ fontSize: 15 }}>حصصك</strong>
          <div className="admin-table-wrap" style={{ marginTop: 14 }}>
            {bookings.length === 0 ? (
              <div className="admin-empty">معندكش حصص متحددة لسه.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>الطالب</th>
                    <th>البرنامج</th>
                    <th>الموعد</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.name}</td>
                      <td>{b.program}</td>
                      <td>{new Date(b.startsAt).toLocaleString("ar-EG")}</td>
                      <td>
                        <span className={`pill-status pill-${b.status}`}>{statusLabels[b.status]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <strong style={{ fontSize: 15 }}>
            <Wallet size={15} style={{ verticalAlign: "middle", marginLeft: 6 }} /> سجل القبض
          </strong>
          <div className="admin-table-wrap" style={{ marginTop: 14 }}>
            {ledger.length === 0 ? (
              <div className="admin-empty">لسه معندكش أي عمليات قبض.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>ملاحظة</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((l) => (
                    <tr key={l.id}>
                      <td>{new Date(l.createdAt).toLocaleDateString("ar-EG")}</td>
                      <td>{l.type === "credit" ? "حصة مكتملة" : l.type === "payout" ? "صرف" : "تعديل"}</td>
                      <td>{Number(l.amount).toFixed(2)} {teacher.currency}</td>
                      <td>{l.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
