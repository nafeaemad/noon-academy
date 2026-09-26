"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Booking = {
  id: number;
  reference: string;
  program: string;
  level: string;
  age: number;
  startsAt: string;
  duration: number;
  timezone: string;
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  cancelled: "ملغي",
  completed: "مكتمل",
};

export function BookingsManager() {
  const [rows, setRows] = useState<Booking[] | null>(null);

  function load() {
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then(setRows);
  }

  useEffect(load, []);

  async function changeStatus(id: number, status: string) {
    setRows((prev) => prev?.map((b) => (b.id === id ? { ...b, status: status as Booking["status"] } : b)) ?? prev);
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <span className="section-label">إدارة الحجوزات والمواعيد</span>
        <h1>الحجوزات</h1>
        <p>كل طلبات الحجز اللي جاية من الموقع، وتقدر تغيّر حالة أي حجز مباشرة.</p>

        <div className="admin-table-wrap" style={{ marginTop: 26 }}>
          {rows === null ? (
            <div className="admin-empty">جاري التحميل...</div>
          ) : rows.length === 0 ? (
            <div className="admin-empty">لا توجد حجوزات حتى الآن.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>المرجع</th>
                  <th>الاسم</th>
                  <th>البرنامج</th>
                  <th>الموعد</th>
                  <th>واتساب</th>
                  <th>البريد</th>
                  <th>الدولة</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td>{b.reference}</td>
                    <td>{b.name}</td>
                    <td>{b.program}</td>
                    <td>{new Date(b.startsAt).toLocaleString("ar-EG")}</td>
                    <td>
                      <a href={`https://wa.me/${b.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                        {b.whatsapp}
                      </a>
                    </td>
                    <td>{b.email}</td>
                    <td>{b.country}</td>
                    <td>
                      <div className="admin-actions">
                        <span className={`pill-status pill-${b.status}`}>{statusLabels[b.status]}</span>
                        <select value={b.status} onChange={(e) => changeStatus(b.id, e.target.value)}>
                          <option value="pending">قيد الانتظار</option>
                          <option value="confirmed">مؤكد</option>
                          <option value="completed">مكتمل</option>
                          <option value="cancelled">ملغي</option>
                        </select>
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
