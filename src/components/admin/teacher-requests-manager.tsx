"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X as XIcon, Pencil, Trash2 } from "lucide-react";

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
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  function load() {
    fetch("/api/admin/teacher-requests")
      .then((r) => r.json())
      .then(setRows);
  }
  useEffect(load, []);

  function noteFor(id: number) {
    return notes[id] || "";
  }
  function setNoteFor(id: number, value: string) {
    setNotes((prev) => ({ ...prev, [id]: value }));
  }

  async function respond(id: number, approve: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/teacher-requests/${id}/respond`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ approve, note: noteFor(id) || undefined }),
      });
      if (res.ok) {
        setNoteFor(id, "");
        setEditingId(null);
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "حدث خطأ");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function removeRequest(id: number) {
    if (!confirm("متأكد إنك عايز تمسح الطلب ده؟ ملحوظة: المسح مش هيرجّع أي إجراء اتنفّذ بالفعل (زي إلغاء حصة أو اعتذار المدرس) — ده بيشيل سجل الطلب بس.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/teacher-requests/${id}/respond`, { method: "DELETE" });
      if (res.ok) {
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "حدث خطأ");
      }
    } finally {
      setBusyId(null);
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
                    <th>ملاحظة الإدارة (اختياري)</th>
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
                      <td style={{ minWidth: 180 }}>
                        <input
                          type="text"
                          className="mini-input"
                          placeholder="اكتب سبب الموافقة أو الرفض..."
                          value={noteFor(r.id)}
                          onChange={(e) => setNoteFor(r.id, e.target.value)}
                        />
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="btn-mini primary"
                            disabled={busyId === r.id}
                            onClick={() => respond(r.id, true)}
                            title="موافقة"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            className="btn-mini danger"
                            disabled={busyId === r.id}
                            onClick={() => respond(r.id, false)}
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
                    <th>إجراء</th>
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
                      <td style={{ minWidth: 180 }}>
                        {editingId === r.id ? (
                          <input
                            type="text"
                            className="mini-input"
                            placeholder="ملاحظة الإدارة..."
                            value={noteFor(r.id)}
                            onChange={(e) => setNoteFor(r.id, e.target.value)}
                            autoFocus
                          />
                        ) : (
                          r.adminNote || "—"
                        )}
                      </td>
                      <td>
                        <div className="admin-actions">
                          {editingId === r.id ? (
                            <>
                              <button
                                className="btn-mini primary"
                                disabled={busyId === r.id}
                                title="حفظ كموافقة"
                                onClick={() => respond(r.id, true)}
                              >
                                <Check size={12} />
                              </button>
                              <button
                                className="btn-mini danger"
                                disabled={busyId === r.id}
                                title="حفظ كرفض"
                                onClick={() => respond(r.id, false)}
                              >
                                <XIcon size={12} />
                              </button>
                              <button
                                className="btn-mini"
                                disabled={busyId === r.id}
                                title="إلغاء"
                                onClick={() => {
                                  setEditingId(null);
                                  setNoteFor(r.id, "");
                                }}
                              >
                                إلغاء
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn-mini"
                                disabled={busyId === r.id}
                                title="تعديل الرد"
                                onClick={() => {
                                  setEditingId(r.id);
                                  setNoteFor(r.id, r.adminNote || "");
                                }}
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                className="btn-mini danger"
                                disabled={busyId === r.id}
                                title="حذف الطلب"
                                onClick={() => removeRequest(r.id)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
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
