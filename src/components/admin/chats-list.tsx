"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

type ChatRow = {
  userId: number;
  name: string;
  email: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
};

export function ChatsList() {
  const [rows, setRows] = useState<ChatRow[] | null>(null);

  function load() {
    fetch("/api/admin/chats")
      .then((r) => r.json())
      .then(setRows);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <span className="section-label">الشات المباشر</span>
        <h1>محادثات الطلاب</h1>
        <p>كل المحادثات اللي بدأها المستخدمون معاك، ورد عليهم بيوصلهم إشعار فوري.</p>

        <div className="admin-table-wrap" style={{ marginTop: 26 }}>
          {rows === null ? (
            <div className="admin-empty">جاري التحميل...</div>
          ) : rows.length === 0 ? (
            <div className="admin-empty">لا توجد محادثات حتى الآن.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>آخر رسالة</th>
                  <th>الوقت</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.userId}>
                    <td>
                      {r.name}
                      {r.unread > 0 && <span className="pill-status pill-pending" style={{ marginInlineStart: 8 }}>{r.unread} جديد</span>}
                      <br />
                      <small style={{ color: "var(--muted)" }}>{r.email}</small>
                    </td>
                    <td style={{ maxWidth: 300 }}>{r.lastMessage}</td>
                    <td>{new Date(r.lastMessageAt).toLocaleString("ar-EG")}</td>
                    <td>
                      <Link className="btn-mini primary" href={`/admin/chats/${r.userId}`}>
                        <MessageCircle size={12} /> فتح
                      </Link>
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
