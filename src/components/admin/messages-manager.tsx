"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Trash2, Mail } from "lucide-react";

type Message = { id: number; name: string; email: string; message: string; createdAt: string };

export function MessagesManager() {
  const [rows, setRows] = useState<Message[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then(setRows);
  }, []);

  async function remove(id: number) {
    if (!confirm("هل تريد حذف هذه الرسالة نهائيًا؟")) return;
    setRows((prev) => prev?.filter((m) => m.id !== id) ?? prev);
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <span className="section-label">الرسائل</span>
        <h1>رسائل تواصل معنا</h1>
        <p>كل الرسائل اللي بيبعتها الزوار من صفحة &quot;تواصل معنا&quot;.</p>

        <div className="admin-table-wrap" style={{ marginTop: 26 }}>
          {rows === null ? (
            <div className="admin-empty">جاري التحميل...</div>
          ) : rows.length === 0 ? (
            <div className="admin-empty">لا توجد رسائل حتى الآن.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>البريد</th>
                  <th>الرسالة</th>
                  <th>التاريخ</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>
                      <a href={`mailto:${m.email}`}>{m.email}</a>
                    </td>
                    <td style={{ maxWidth: 320, whiteSpace: "pre-wrap" }}>{m.message}</td>
                    <td>{new Date(m.createdAt).toLocaleString("ar-EG")}</td>
                    <td>
                      <div className="admin-actions">
                        <a className="btn-mini" href={`mailto:${m.email}`} title="رد بالإيميل">
                          <Mail size={12} />
                        </a>
                        <button className="btn-mini danger" onClick={() => remove(m.id)}>
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
