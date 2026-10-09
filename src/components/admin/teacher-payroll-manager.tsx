"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";

type Teacher = { id: number; nameAr: string; ratePerLesson: string };
type LedgerRow = { id: number; amount: string; type: string; note: string | null; createdAt: string };
type AttendanceRow = { id: number; date: string; status: string; note: string | null };

const statusLabels: Record<string, string> = { present: "حاضر", absent: "غائب", excused: "معتذر" };

export function TeacherPayrollManager({ teacherId }: { teacherId: number }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [balance, setBalance] = useState(0);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  function load() {
    fetch("/api/admin/teachers")
      .then((r) => r.json())
      .then((rows: Teacher[]) => setTeacher(rows.find((t) => t.id === teacherId) || null));
    fetch(`/api/admin/teachers/${teacherId}/ledger`)
      .then((r) => r.json())
      .then((data) => {
        setLedger(data.rows);
        setBalance(data.balance);
      });
    fetch(`/api/admin/teachers/${teacherId}/attendance`)
      .then((r) => r.json())
      .then(setAttendance);
  }

  useEffect(load, [teacherId]);

  async function submitPayout() {
    const value = Number(amount);
    if (!value || value <= 0) {
      setStatus("أدخل مبلغًا صحيحًا.");
      return;
    }
    const res = await fetch(`/api/admin/teachers/${teacherId}/payout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: value, note: note || undefined }),
    });
    if (res.ok) {
      setStatus("تم تسجيل الصرف ✓");
      setAmount("");
      setNote("");
      load();
    } else {
      setStatus("حدث خطأ");
    }
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin/teachers">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع لإدارة المدرسين
        </Link>
        <span className="section-label">القبض والحضور</span>
        <h1 style={{ margin: "8px 0 0" }}>{teacher?.nameAr || "..."}</h1>

        <div className="admin-stats">
          <div>
            <strong>{balance.toFixed(2)}</strong>
            <span>الرصيد المستحق حاليًا</span>
          </div>
          <div>
            <strong>{teacher ? Number(teacher.ratePerLesson).toFixed(2) : "—"}</strong>
            <span>سعر الحصة الواحدة</span>
          </div>
          <div>
            <strong>{attendance.filter((a) => a.status === "present").length}</strong>
            <span>أيام حضور</span>
          </div>
          <div>
            <strong>{attendance.filter((a) => a.status === "absent").length}</strong>
            <span>أيام غياب</span>
          </div>
        </div>

        <div className="admin-panel">
          <strong style={{ fontSize: 15 }}>
            <Wallet size={15} style={{ verticalAlign: "middle", marginLeft: 6 }} /> تسجيل صرف مستحقات
          </strong>
          <div className="form-grid" style={{ marginTop: 12 }}>
            <div className="field">
              <label>المبلغ المصروف</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="field">
              <label>ملاحظة (اختياري)</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <div className="save-bar">
            <button className="button button-primary" onClick={submitPayout}>
              تسجيل الصرف
            </button>
            {status && <span className="status-message success" style={{ margin: 0 }}>{status}</span>}
          </div>
        </div>

        <div className="admin-panel">
          <strong style={{ fontSize: 15 }}>سجل القبض</strong>
          <div className="admin-table-wrap" style={{ marginTop: 14 }}>
            {ledger.length === 0 ? (
              <div className="admin-empty">لا توجد عمليات بعد.</div>
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
                      <td style={{ color: Number(l.amount) < 0 ? "#9d2920" : "#1e6549" }}>{Number(l.amount).toFixed(2)}</td>
                      <td>{l.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <strong style={{ fontSize: 15 }}>سجل الحضور والغياب</strong>
          <div className="admin-table-wrap" style={{ marginTop: 14 }}>
            {attendance.length === 0 ? (
              <div className="admin-empty">لا يوجد سجل حضور بعد.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>اليوم</th>
                    <th>الحالة</th>
                    <th>ملاحظة</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td>
                        <span className={`pill-status ${a.status === "present" ? "pill-approved" : a.status === "absent" ? "pill-rejected" : "pill-pending"}`}>
                          {statusLabels[a.status] || a.status}
                        </span>
                      </td>
                      <td>{a.note || "—"}</td>
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
