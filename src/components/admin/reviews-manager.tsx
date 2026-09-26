"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X, Trash2, Star } from "lucide-react";

type Review = {
  id: number;
  firstName: string;
  country: string;
  program: string;
  category: string;
  rating: number;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "موافق عليه",
  rejected: "مرفوض",
};

export function ReviewsManager() {
  const [rows, setRows] = useState<Review[] | null>(null);

  function load() {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then(setRows);
  }

  useEffect(load, []);

  async function setStatus(id: number, status: string) {
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, status: status as Review["status"] } : r)) ?? prev);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function remove(id: number) {
    if (!confirm("هل تريد حذف هذا التقييم نهائيًا؟")) return;
    setRows((prev) => prev?.filter((r) => r.id !== id) ?? prev);
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <span className="section-label">التقييمات والموافقة عليها</span>
        <h1>تقييمات الطلاب</h1>
        <p>وافق أو ارفض التقييمات اللي بيبعتها الطلاب قبل ما تظهر في صفحة المراجعات بالموقع.</p>

        <div className="admin-table-wrap" style={{ marginTop: 26 }}>
          {rows === null ? (
            <div className="admin-empty">جاري التحميل...</div>
          ) : rows.length === 0 ? (
            <div className="admin-empty">لا توجد تقييمات حتى الآن.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الدولة</th>
                  <th>البرنامج</th>
                  <th>التقييم</th>
                  <th>النص</th>
                  <th>الحالة</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.firstName}</td>
                    <td>{r.country}</td>
                    <td>{r.program}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        {r.rating} <Star size={12} />
                      </span>
                    </td>
                    <td style={{ maxWidth: 260 }}>{r.content}</td>
                    <td>
                      <span className={`pill-status pill-${r.status}`}>{statusLabels[r.status]}</span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn-mini primary" onClick={() => setStatus(r.id, "approved")}>
                          <Check size={12} />
                        </button>
                        <button className="btn-mini" onClick={() => setStatus(r.id, "rejected")}>
                          <X size={12} />
                        </button>
                        <button className="btn-mini danger" onClick={() => remove(r.id)}>
                          <Trash2 size={12} />
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
    </main>
  );
}
