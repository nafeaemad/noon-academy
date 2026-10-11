"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X as XIcon, Pencil, Trash2, Zap } from "lucide-react";
import { toast } from "@/components/toast-provider";

type RequestRow = {
  id: number;
  type: "leave" | "cancel_lesson" | "rate_change";
  reason: string;
  status: "pending" | "approved" | "rejected";
  adminNote: string | null;
  createdAt: string;
  teacherId: number;
  teacherNameAr: string | null;
  teacherCurrency: string | null;
  bookingId: number | null;
  bookingReference: string | null;
  bookingStartsAt: string | null;
  requestedRate: string | null;
  currentRate: string | null;
  autoActivate: boolean;
  effectiveAt: string | null;
  applied: boolean;
};

const typeLabels: Record<string, string> = { leave: "إجازة / اعتذار", cancel_lesson: "إلغاء حصة", rate_change: "تغيير سعر الحصة" };
const statusLabels: Record<string, string> = { pending: "قيد المراجعة", approved: "تمت الموافقة", rejected: "مرفوض" };

export function TeacherRequestsManager() {
  const [rows, setRows] = useState<RequestRow[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activationMode, setActivationMode] = useState<Record<number, "now" | "scheduled" | "manual">>({});
  const [scheduledAt, setScheduledAt] = useState<Record<number, string>>({});

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

  async function respond(r: RequestRow, approve: boolean) {
    setBusyId(r.id);
    try {
      const body: Record<string, unknown> = { approve, note: noteFor(r.id) || undefined };
      if (r.type === "rate_change" && approve) {
        const mode = activationMode[r.id] || "manual";
        body.activation = mode;
        if (mode === "scheduled") body.effectiveAt = scheduledAt[r.id] || undefined;
      }
      const res = await fetch(`/api/admin/teacher-requests/${r.id}/respond`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setNoteFor(r.id, "");
        setEditingId(null);
        load();
        toast({ type: approve ? "success" : "info", title: approve ? "تمت الموافقة على الطلب ✓" : "تم رفض الطلب" });
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ type: "error", title: "حدث خطأ", message: data.error || undefined });
      }
    } finally {
      setBusyId(null);
    }
  }

  async function applyNow(id: number) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/teacher-requests/${id}/apply-rate`, { method: "POST" });
      if (res.ok) {
        load();
        toast({ type: "success", title: "تم تفعيل السعر الجديد ✓" });
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ type: "error", title: "حدث خطأ", message: data.error || undefined });
      }
    } finally {
      setBusyId(null);
    }
  }

  async function removeRequest(id: number) {
    if (!confirm("متأكد إنك عايز تمسح الطلب ده؟ ملحوظة: المسح مش هيرجّع أي إجراء اتنفّذ بالفعل (زي إلغاء حصة أو تفعيل سعر جديد) — ده بيشيل سجل الطلب بس.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/teacher-requests/${id}/respond`, { method: "DELETE" });
      if (res.ok) {
        load();
        toast({ type: "success", title: "تم حذف الطلب ✓" });
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ type: "error", title: "حدث خطأ", message: data.error || undefined });
      }
    } finally {
      setBusyId(null);
    }
  }

  const pending = rows?.filter((r) => r.status === "pending") || [];
  const resolved = rows?.filter((r) => r.status !== "pending") || [];

  function describeRate(r: RequestRow) {
    const cur = r.teacherCurrency || "";
    return `${Number(r.currentRate || 0).toFixed(2)} ← ${Number(r.requestedRate || 0).toFixed(2)} ${cur}`;
  }

  function rateActivationStatus(r: RequestRow) {
    if (r.status !== "approved") return null;
    if (r.applied) return <span className="pill-status pill-approved">مفعّل</span>;
    if (r.autoActivate && r.effectiveAt) {
      return <span className="pill-status pill-pending">هيتفعّل {new Date(r.effectiveAt).toLocaleString("ar-EG")}</span>;
    }
    return <span className="pill-status pill-pending">لسه مش مفعّل</span>;
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <span className="section-label">طلبات المعلمين</span>
        <h1 style={{ margin: "8px 0 0" }}>طلبات الإجازة وإلغاء الحصص وتغيير السعر</h1>

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
                    <th>التفاصيل</th>
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
                      <td style={{ minWidth: 200 }}>
                        {r.type === "cancel_lesson" && (r.bookingReference ? `${r.bookingReference} — ${new Date(r.bookingStartsAt!).toLocaleString("ar-EG")}` : "—")}
                        {r.type === "rate_change" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <strong>{describeRate(r)}</strong>
                            <select
                              className="mini-input"
                              value={activationMode[r.id] || "manual"}
                              onChange={(e) => setActivationMode((prev) => ({ ...prev, [r.id]: e.target.value as "now" | "scheduled" | "manual" }))}
                            >
                              <option value="now">تفعيل فوري عند الموافقة</option>
                              <option value="scheduled">تفعيل في وقت محدد</option>
                              <option value="manual">رفض التفعيل التلقائي (تفعيل لاحقًا يدويًا)</option>
                            </select>
                            {(activationMode[r.id] || "manual") === "scheduled" && (
                              <input
                                type="datetime-local"
                                className="mini-input"
                                value={scheduledAt[r.id] || ""}
                                onChange={(e) => setScheduledAt((prev) => ({ ...prev, [r.id]: e.target.value }))}
                              />
                            )}
                          </div>
                        )}
                      </td>
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
                            onClick={() => respond(r, true)}
                            title="موافقة"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            className="btn-mini danger"
                            disabled={busyId === r.id}
                            onClick={() => respond(r, false)}
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
                      <td>
                        {typeLabels[r.type]}
                        {r.type === "rate_change" && (
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{describeRate(r)}</div>
                        )}
                      </td>
                      <td>{r.reason}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                          <span className={`pill-status ${r.status === "approved" ? "pill-approved" : "pill-rejected"}`}>{statusLabels[r.status]}</span>
                          {r.type === "rate_change" && rateActivationStatus(r)}
                        </div>
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
                                onClick={() => respond(r, true)}
                              >
                                <Check size={12} />
                              </button>
                              <button
                                className="btn-mini danger"
                                disabled={busyId === r.id}
                                title="حفظ كرفض"
                                onClick={() => respond(r, false)}
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
                              {r.type === "rate_change" && r.status === "approved" && !r.applied && (
                                <button
                                  className="btn-mini primary"
                                  disabled={busyId === r.id}
                                  title="فعّل السعر الآن"
                                  onClick={() => applyNow(r.id)}
                                >
                                  <Zap size={12} />
                                </button>
                              )}
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
