"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Trash2, KeyRound, X } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  provider: string;
  createdAt: string;
  bookingCount: number;
};

const providerLabel: Record<string, string> = {
  credentials: "بريد وباسورد",
  google: "جوجل",
};

export function UsersManager() {
  const [rows, setRows] = useState<User[] | null>(null);
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");

  function load() {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setRows);
  }
  useEffect(load, []);

  async function remove(id: number, name: string) {
    if (!confirm(`هل تريد حذف حساب "${name}" نهائيًا؟ لن يستطيع تسجيل الدخول بعد ذلك.`)) return;
    setRows((prev) => prev?.filter((u) => u.id !== id) ?? prev);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
  }

  function startReset(id: number) {
    setResettingId(id);
    setNewPassword("");
    setStatus("");
  }

  async function submitReset() {
    if (!resettingId) return;
    if (newPassword.length < 6) {
      setStatus("كلمة المرور لازم تكون 6 حروف على الأقل.");
      return;
    }
    const res = await fetch(`/api/admin/users/${resettingId}/reset-password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    if (res.ok) {
      setStatus("تم تغيير كلمة المرور ✓");
      setTimeout(() => setResettingId(null), 1200);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus(data.error || "حدث خطأ");
    }
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <span className="section-label">حسابات المستخدمين</span>
        <h1>المستخدمون المسجّلون</h1>
        <p>كل الحسابات اللي عملها الزوار على الموقع، وتقدر تحذف أي حساب أو تغيّر كلمة مروره من هنا.</p>

        {resettingId !== null && (
          <div className="admin-panel" style={{ marginTop: 20 }}>
            <div className="admin-toolbar" style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: 14 }}>تعيين كلمة مرور جديدة</strong>
              <button className="btn-mini" onClick={() => setResettingId(null)}>
                <X size={14} />
              </button>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>كلمة المرور الجديدة</label>
                <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="6 أحرف على الأقل" />
              </div>
            </div>
            <div className="save-bar">
              <button className="button button-primary" onClick={submitReset}>
                حفظ كلمة المرور
              </button>
              {status && <span className="status-message" style={{ margin: 0 }}>{status}</span>}
            </div>
          </div>
        )}

        <div className="admin-table-wrap" style={{ marginTop: 26 }}>
          {rows === null ? (
            <div className="admin-empty">جاري التحميل...</div>
          ) : rows.length === 0 ? (
            <div className="admin-empty">لا يوجد مستخدمون مسجّلون بعد.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>البريد الإلكتروني</th>
                  <th>طريقة التسجيل</th>
                  <th>عدد الحجوزات</th>
                  <th>تاريخ التسجيل</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{providerLabel[u.provider] || u.provider}</td>
                    <td>{u.bookingCount}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString("ar-EG")}</td>
                    <td>
                      <div className="admin-actions">
                        {u.provider === "credentials" && (
                          <button className="btn-mini" onClick={() => startReset(u.id)} title="تغيير كلمة المرور">
                            <KeyRound size={12} />
                          </button>
                        )}
                        <button className="btn-mini danger" onClick={() => remove(u.id, u.name)} title="حذف الحساب">
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
