"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Wallet, Printer } from "lucide-react";
import { toast } from "@/components/toast-provider";

type Teacher = { id: number; nameAr: string; ratePerLesson: string; currency: string };
type PaymentRow = {
  id: number;
  amount: string;
  note: string | null;
  createdAt: string;
  teacherId: number;
  teacherNameAr: string;
  currency: string;
};

export function PaymentsManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/teachers").then((r) => r.json()).then(setTeachers);
    fetch("/api/admin/payments").then((r) => r.json()).then(setPayments);
  }
  useEffect(load, []);

  useEffect(() => {
    if (!teacherId) return;
    fetch(`/api/admin/teachers/${teacherId}/ledger`)
      .then((r) => r.json())
      .then((data) => setBalance(data.balance));
  }, [teacherId]);

  const selectedTeacher = teachers.find((t) => String(t.id) === teacherId);

  async function submit() {
    setStatus("");
    const value = Number(amount);
    if (!teacherId) {
      setStatus("اختار المدرس الأول.");
      return;
    }
    if (!value || value <= 0) {
      setStatus("أدخل مبلغًا صحيحًا.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}/payout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: value, note: note || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("تم إيداع المبلغ في حساب المدرس وتم إشعاره ✓");
        toast({ type: "success", title: "تم إيداع المبلغ ✓", message: `${selectedTeacher?.nameAr || ""}: ${value.toFixed(2)} ${selectedTeacher?.currency || ""}` });
        setAmount("");
        setNote("");
        setBalance(typeof data.balance === "number" ? data.balance : balance);
        load();
      } else {
        setStatus(data.error || "حدث خطأ");
        toast({ type: "error", title: "حدث خطأ", message: data.error || undefined });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back no-print" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <div className="admin-toolbar no-print">
          <div>
            <span className="section-label">تسوية المدفوعات</span>
            <h1 style={{ margin: "8px 0 0" }}>تسوية مدفوعات المعلمين</h1>
          </div>
          <button className="btn-mini" onClick={() => window.print()}>
            <Printer size={14} /> طباعة سجل المدفوعات PDF
          </button>
        </div>

        <div className="print-only" style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0 }}>سجل تسوية مدفوعات المعلمين</h1>
          <p style={{ color: "#555" }}>تاريخ التقرير: {new Date().toLocaleDateString("ar-EG")}</p>
        </div>

        <div className="admin-panel no-print">
          <strong style={{ fontSize: 15 }}>
            <Wallet size={15} style={{ verticalAlign: "middle", marginLeft: 6 }} /> تسجيل دفعة جديدة
          </strong>
          <div className="form-grid" style={{ marginTop: 12 }}>
            <div className="field">
              <label>المدرس</label>
              <select
                value={teacherId}
                onChange={(e) => {
                  setTeacherId(e.target.value);
                  setBalance(null);
                }}
              >
                <option value="">اختار المدرس</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nameAr}
                  </option>
                ))}
              </select>
            </div>
            {selectedTeacher && balance !== null && (
              <div className="field">
                <label>الرصيد المستحق حاليًا</label>
                <input disabled value={`${balance.toFixed(2)} ${selectedTeacher.currency}`} />
              </div>
            )}
            <div className="field">
              <label>المبلغ المستلم</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="field">
              <label>ملاحظة (اختياري)</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="مثال: تسوية شهر أكتوبر" />
            </div>
          </div>
          <div className="save-bar">
            <button className="button button-primary" onClick={submit} disabled={saving}>
              {saving ? "جاري الإيداع..." : "إيداع المبلغ في حساب المدرس"}
            </button>
            {status && <span className="status-message success" style={{ margin: 0 }}>{status}</span>}
          </div>
          <p className="form-note" style={{ marginTop: 10 }}>
            لما تضيف المبلغ، هيتسجل في سجل القبض بتاع المدرس، وهيوصله إشعار فوري، وهيظهر في تقريره القابل للطباعة.
          </p>
        </div>

        <div className="admin-panel">
          <strong style={{ fontSize: 15 }}>آخر المدفوعات لكل المعلمين</strong>
          <div className="admin-table-wrap" style={{ marginTop: 14 }}>
            {payments.length === 0 ? (
              <div className="admin-empty">لا توجد مدفوعات بعد.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>المدرس</th>
                    <th>المبلغ</th>
                    <th>ملاحظة</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{new Date(p.createdAt).toLocaleDateString("ar-EG")}</td>
                      <td>{p.teacherNameAr}</td>
                      <td>{Math.abs(Number(p.amount)).toFixed(2)} {p.currency}</td>
                      <td>{p.note || "—"}</td>
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
