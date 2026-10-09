"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Pencil, Trash2, X, CheckCircle2, KeyRound, Wallet } from "lucide-react";

type Teacher = {
  id: number;
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  qualificationsAr: string;
  qualificationsEn: string;
  languages: string[];
  yearsExperience: number | null;
  imageUrl: string | null;
  active: boolean;
  availabilityAr: string;
  availabilityEn: string;
  email: string | null;
  approved: boolean;
  meetingLink: string | null;
  excused: boolean;
  excuseReason: string | null;
  ratePerLesson: string;
};

const empty = {
  nameAr: "",
  nameEn: "",
  specialtyAr: "",
  specialtyEn: "",
  qualificationsAr: "",
  qualificationsEn: "",
  languages: "",
  yearsExperience: "",
  imageUrl: "",
  active: true,
  availabilityAr: "متاح الآن",
  availabilityEn: "Available now",
  email: "",
  meetingLink: "",
  ratePerLesson: "0",
  excused: false,
};

export function TeachersManager() {
  const [rows, setRows] = useState<Teacher[] | null>(null);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [teachersVisible, setTeachersVisible] = useState<boolean | null>(null);
  const [savingVisibility, setSavingVisibility] = useState(false);

  function load() {
    fetch("/api/admin/teachers")
      .then((r) => r.json())
      .then(setRows);
  }

  function loadSettings() {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setTeachersVisible(data ? Boolean(data.teachersVisible) : true));
  }

  useEffect(load, []);
  useEffect(loadSettings, []);

  async function toggleVisibility(next: boolean) {
    setSavingVisibility(true);
    setTeachersVisible(next);
    try {
      const current = await fetch("/api/admin/settings").then((r) => r.json());
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...current, teachersVisible: next }),
      });
    } finally {
      setSavingVisibility(false);
    }
  }

  function startNew() {
    setForm(empty);
    setEditingId("new");
  }

  function startEdit(t: Teacher) {
    setForm({
      nameAr: t.nameAr,
      nameEn: t.nameEn,
      specialtyAr: t.specialtyAr,
      specialtyEn: t.specialtyEn,
      qualificationsAr: t.qualificationsAr,
      qualificationsEn: t.qualificationsEn,
      languages: (t.languages || []).join(", "),
      yearsExperience: t.yearsExperience ? String(t.yearsExperience) : "",
      imageUrl: t.imageUrl || "",
      active: t.active,
      availabilityAr: t.availabilityAr,
      availabilityEn: t.availabilityEn,
      email: t.email || "",
      meetingLink: t.meetingLink || "",
      ratePerLesson: t.ratePerLesson || "0",
      excused: t.excused,
    });
    setEditingId(t.id);
  }

  async function approve(id: number) {
    await fetch(`/api/admin/teachers/${id}/approve`, { method: "POST" });
    load();
  }

  async function resetPassword(id: number) {
    const password = prompt("كلمة المرور الجديدة للمدرس (6 أحرف على الأقل):");
    if (!password) return;
    const res = await fetch(`/api/admin/teachers/${id}/reset-password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) alert("تم تغيير كلمة المرور ✓");
    else alert("حدث خطأ");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const method = editingId === "new" ? "POST" : "PATCH";
    const url = editingId === "new" ? "/api/admin/teachers" : `/api/admin/teachers/${editingId}`;
    await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditingId(null);
    load();
  }

  async function remove(id: number) {
    if (!confirm("هل تريد حذف هذا المدرس؟")) return;
    await fetch(`/api/admin/teachers/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <div className="admin-toolbar">
          <div>
            <span className="section-label">إدارة الطلاب والمدرسين</span>
            <h1 style={{ margin: "8px 0 0" }}>المدرسون</h1>
          </div>
          {editingId === null && (
            <button className="button button-primary" onClick={startNew}>
              <Plus size={16} /> إضافة مدرس
            </button>
          )}
        </div>

        {teachersVisible !== null && (
          <div className="admin-panel" style={{ marginBottom: 20 }}>
            <div className="admin-toolbar" style={{ marginBottom: 0 }}>
              <div>
                <strong style={{ fontSize: 15 }}>إظهار صفحة المدرسين في الموقع</strong>
                <p style={{ margin: "6px 0 0", fontSize: 12 }}>
                  لما تكون متوقفة، هتختفي صفحة &quot;المدرسون&quot; وقسمهم من الصفحة الرئيسية من الموقع العام، لكن تقدر لسه تضيف وتعدّل مدرسين من هنا عادي.
                </p>
              </div>
              <label className="toggle-row" style={{ flex: "0 0 auto" }}>
                <input
                  type="checkbox"
                  checked={teachersVisible}
                  disabled={savingVisibility}
                  onChange={(e) => toggleVisibility(e.target.checked)}
                />
                {teachersVisible ? "ظاهرة" : "مخفية"}
              </label>
            </div>
          </div>
        )}

        {editingId !== null && (
          <form className="admin-panel" onSubmit={submit}>
            <div className="admin-toolbar" style={{ marginBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>{editingId === "new" ? "إضافة مدرس جديد" : "تعديل بيانات المدرس"}</h2>
              <button type="button" className="btn-mini" onClick={() => setEditingId(null)}>
                <X size={14} />
              </button>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>الاسم (عربي)</label>
                <input required value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
              </div>
              <div className="field">
                <label>Name (English)</label>
                <input required value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
              </div>
              <div className="field">
                <label>التخصص (عربي)</label>
                <input required value={form.specialtyAr} onChange={(e) => setForm({ ...form, specialtyAr: e.target.value })} />
              </div>
              <div className="field">
                <label>Specialty (English)</label>
                <input required value={form.specialtyEn} onChange={(e) => setForm({ ...form, specialtyEn: e.target.value })} />
              </div>
              <div className="field full">
                <label>المؤهلات (عربي)</label>
                <textarea required value={form.qualificationsAr} onChange={(e) => setForm({ ...form, qualificationsAr: e.target.value })} />
              </div>
              <div className="field full">
                <label>Qualifications (English)</label>
                <textarea required value={form.qualificationsEn} onChange={(e) => setForm({ ...form, qualificationsEn: e.target.value })} />
              </div>
              <div className="field">
                <label>اللغات (افصل بفاصلة)</label>
                <input placeholder="Arabic, English" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
              </div>
              <div className="field">
                <label>سنوات الخبرة</label>
                <input type="number" value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} />
              </div>
              <div className="field full">
                <label>رابط الصورة</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="field">
                <label>البريد الإلكتروني (لتسجيل دخول المدرس)</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>سعر الحصة الواحدة (قبض)</label>
                <input type="number" step="0.01" value={form.ratePerLesson} onChange={(e) => setForm({ ...form, ratePerLesson: e.target.value })} />
              </div>
              <div className="field full">
                <label>لينك الزوم / جوجل ميت الثابت بتاع المدرس</label>
                <input value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://..." />
              </div>
              <div className="field">
                <label className="toggle-row">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  ظاهر في الموقع
                </label>
              </div>
              <div className="field">
                <label className="toggle-row">
                  <input type="checkbox" checked={form.excused} onChange={(e) => setForm({ ...form, excused: e.target.checked })} />
                  معتذر حاليًا
                </label>
              </div>
              <div className="field">
                <label>حالة التوفر (عربي) — تظهر كشارة على كارت المدرس</label>
                <input
                  value={form.availabilityAr}
                  onChange={(e) => setForm({ ...form, availabilityAr: e.target.value })}
                  placeholder="متاح الآن / الجدول ممتلئ حتى الأسبوع القادم / متاح من السبت..."
                />
              </div>
              <div className="field">
                <label>Availability status (English)</label>
                <input
                  value={form.availabilityEn}
                  onChange={(e) => setForm({ ...form, availabilityEn: e.target.value })}
                  placeholder="Available now / Fully booked until next week..."
                />
              </div>
            </div>
            <div className="save-bar">
              <button className="button button-primary" type="submit">حفظ</button>
            </div>
          </form>
        )}

        <div className="admin-table-wrap" style={{ marginTop: 26 }}>
          {rows === null ? (
            <div className="admin-empty">جاري التحميل...</div>
          ) : rows.length === 0 ? (
            <div className="admin-empty">لا يوجد مدرسون بعد.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>التخصص</th>
                  <th>البريد</th>
                  <th>الحساب</th>
                  <th>الظهور</th>
                  <th>حالة التوفر</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td>{t.nameAr}</td>
                    <td>{t.specialtyAr}</td>
                    <td>{t.email || "—"}</td>
                    <td>
                      {t.email ? (
                        <span className={`pill-status ${t.approved ? "pill-approved" : "pill-pending"}`}>
                          {t.approved ? "مفعّل" : "بانتظار الموافقة"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className={`pill-status ${t.active ? "pill-approved" : "pill-rejected"}`}>
                        {t.active ? "ظاهر" : "مخفي"}
                      </span>
                    </td>
                    <td>
                      <span className="pill-status pill-confirmed">{t.excused ? "معتذر" : t.availabilityAr}</span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        {t.email && !t.approved && (
                          <button className="btn-mini primary" onClick={() => approve(t.id)} title="الموافقة على الحساب">
                            <CheckCircle2 size={12} />
                          </button>
                        )}
                        <Link className="btn-mini" href={`/admin/teachers/${t.id}`} title="القبض والحضور">
                          <Wallet size={12} />
                        </Link>
                        {t.email && (
                          <button className="btn-mini" onClick={() => resetPassword(t.id)} title="تغيير كلمة المرور">
                            <KeyRound size={12} />
                          </button>
                        )}
                        <button className="btn-mini" onClick={() => startEdit(t)}>
                          <Pencil size={12} />
                        </button>
                        <button className="btn-mini danger" onClick={() => remove(t.id)}>
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
