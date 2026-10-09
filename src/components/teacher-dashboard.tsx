"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Save, Video, CalendarCheck, Wallet, Ban } from "lucide-react";

type Teacher = {
  id: number;
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  qualificationsAr: string;
  meetingLink: string | null;
  excused: boolean;
  excuseReason: string | null;
  ratePerLesson: string;
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

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  cancelled: "ملغي",
  completed: "مكتمل",
};

export function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [meetingLink, setMeetingLink] = useState("");
  const [excused, setExcused] = useState(false);
  const [excuseReason, setExcuseReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  function load() {
    fetch("/api/teacher/me").then((r) => r.json()).then((t) => {
      setTeacher(t);
      setMeetingLink(t.meetingLink || "");
      setExcused(Boolean(t.excused));
      setExcuseReason(t.excuseReason || "");
    });
    fetch("/api/teacher/bookings").then((r) => r.json()).then(setBookings);
    fetch("/api/teacher/attendance").then((r) => r.json()).then(setAttendance);
    fetch("/api/teacher/ledger").then((r) => r.json()).then(setLedger);
  }

  useEffect(load, []);

  async function saveProfile() {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/teacher/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ meetingLink, excused, excuseReason }),
      });
      if (res.ok) {
        setStatus("تم الحفظ ✓");
        load();
      } else {
        setStatus("حدث خطأ أثناء الحفظ");
      }
    } finally {
      setSaving(false);
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

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-toolbar">
          <div>
            <span className="section-label">بوابة المعلمين</span>
            <h1 style={{ margin: "8px 0 0" }}>أهلًا، {teacher.nameAr}</h1>
          </div>
          <button className="btn-mini danger" onClick={logout}>
            <LogOut size={14} /> تسجيل الخروج
          </button>
        </div>

        <div className="admin-stats">
          <div>
            <strong>{teacher.balance.toFixed(2)}</strong>
            <span>رصيدك الحالي (قبض)</span>
          </div>
          <div>
            <strong>{Number(teacher.ratePerLesson).toFixed(2)}</strong>
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

        <div className="admin-panel">
          <div className="admin-toolbar" style={{ marginBottom: 10 }}>
            <strong style={{ fontSize: 15 }}>
              <Video size={15} style={{ verticalAlign: "middle", marginLeft: 6 }} /> بياناتك
            </strong>
          </div>
          <div className="form-grid">
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

        <div className="admin-panel">
          <div className="admin-toolbar" style={{ marginBottom: 10 }}>
            <strong style={{ fontSize: 15 }}>
              <CalendarCheck size={15} style={{ verticalAlign: "middle", marginLeft: 6 }} /> الحضور اليومي
            </strong>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 12px" }}>
            {today ? `تم تسجيل حضورك النهاردة: ${statusLabels[today.status] || today.status}` : "لسه ماسجلتش حضورك النهاردة."}
          </p>
          <div className="admin-actions">
            <button className="btn-mini primary" onClick={() => checkin("present")}>تسجيل حضور</button>
            <button className="btn-mini danger" onClick={() => checkin("absent")}>تسجيل غياب</button>
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
                      <td>{Number(l.amount).toFixed(2)}</td>
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
