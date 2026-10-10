"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X as XIcon } from "lucide-react";

type RequestRow = {
  id: number;
  type: "leave" | "cancel_lesson";
  reason: string;
  status: "pending" | "approved" | "rejected";
  adminNote: string | null;
  createdAt: string;
  teacherId: number;
  teacherNameAr: string | null;
  bookingId: number | null;
  bookingReference: string | null;
  bookingStartsAt: string | null;
};

const typeLabels: Record<string, string> = { leave: "إجازة / اعتذار", cancel_lesson: "إلغاء حصة" };
const statusLabels: Record<string, string> = { pending: "قيد المراجعة", approved: "تمت الموافقة", rejected: "مرفوض" };

export function TeacherRequestsManager() {
  const [rows, setRows] = useState<RequestRow[] | null>(null);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [note, setNote] = useState("");

  function load() {
    fetch("/api/admin/teacher-requests")
      .then((r) => r.json())
      .then(setRows);
  }
  useEffect(load, []);

  async function respond(id: number, approve: boolean) {
    setRespondingId(id);
    try {
      const res = await fetch(`/api/admin/teacher-requests/${id}/respond`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ approve, note: note || undefined }),
      });
      if (res.ok) {
        setNote("");
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "حدث خطأ");
      }
    } finally {
      setRespondingId(null);
    }
  }

  const pending = rows?.filter((r) => r.status === "pending") || [];
  const resolved = rows?.filter((r) => r.status !== "pending") || [];

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <span className="section-label">طلبات المعلمين</span>
        <h1 style={{ margin: "8px 0 0" }}>طلبات الإجازة وإلغاء الحصص</h1>

        <div className="admin-panel" style={{ marginTop: 20 }}>
          <strong style={{ fontSize: 15 }}>طلبات قيد المراجعة ({pending.length})</strong>
          <div className="admin-table-wrap" style={{ marginTop: 14 }}>
            {rows === null ? (
              <div className="admin-empty">جاري التحميل...</div>
            ) : pending.length === 0 ? (
              <div className="admin-empty">لا توجد طلبات معلّقة حاليًا.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>المعلم</th>
                    <th>النوع</th>
                    <th>السبب</th>
                    <th>الحصة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((r) => (
                    <tr key={r.id}>
                      <td>{r.teacherNameAr || "—"}</td>
                      <td>{typeLabels[r.type]}</td>
                      <td>{r.reason}</td>
                      <td>{r.bookingReference ? `${r.bookingReference} — ${new Date(r.bookingStartsAt!).toLocaleString("ar-EG")}` : "—"}</td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="btn-mini primary"
                            disabled={respondingId === r.id}
                            onClick={() => {
                              setNote("");
                              respond(r.id, true);
                            }}
                            title="موافقة"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            className="btn-mini danger"
                            disabled={respondingId === r.id}
                            onClick={() => {
                              const value = prompt("سبب الرفض (اختياري):") || "";
                              setNote(value);
                              respond(r.id, false);
                            }}
                            title="رفض"
                          >
                            <XIcon size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <strong style={{ fontSize: 15 }}>طلبات تم الرد عليها</strong>
          <div className="admin-table-wrap" style={{ marginTop: 14 }}>
            {resolved.length === 0 ? (
              <div className="admin-empty">لا يوجد سجل بعد.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>المعلم</th>
                    <th>النوع</th>
                    <th>السبب</th>
                    <th>الحالة</th>
                    <th>ملاحظة الإدارة</th>
                  </tr>
                </thead>
                <tbody>
                  {resolved.map((r) => (
                    <tr key={r.id}>
                      <td>{r.teacherNameAr || "—"}</td>
                      <td>{typeLabels[r.type]}</td>
                      <td>{r.reason}</td>
                      <td>
                        <span className={`pill-status ${r.status === "approved" ? "pill-approved" : "pill-rejected"}`}>{statusLabels[r.status]}</span>
                      </td>
                      <td>{r.adminNote || "—"}</td>
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
