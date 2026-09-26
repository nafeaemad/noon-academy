"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Save } from "lucide-react";

type Settings = {
  whatsapp: string;
  email: string;
  responseTimeAr: string;
  responseTimeEn: string;
  facebook: string | null;
  instagram: string | null;
};

const empty: Settings = {
  whatsapp: "",
  email: "",
  responseTimeAr: "",
  responseTimeEn: "",
  facebook: "",
  instagram: "",
};

export function SettingsManager() {
  const [form, setForm] = useState<Settings>(empty);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data) setForm({ ...empty, ...data });
        setLoading(false);
      });
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "تم الحفظ بنجاح ✓" : "حدث خطأ، حاول مرة أخرى");
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <span className="section-label">التواصل والإشعارات</span>
        <h1>إعدادات التواصل معنا</h1>
        <p>رقم الواتساب والإيميل ووقت الرد اللي بيظهروا في صفحة &quot;تواصل معنا&quot; وفي الفوتر وزرار الواتساب العائم في كل صفحات الموقع.</p>

        {loading ? (
          <div className="admin-empty">جاري التحميل...</div>
        ) : (
          <form className="admin-panel" onSubmit={submit} style={{ marginTop: 28 }}>
            <div className="form-grid">
              <div className="field">
                <label>رقم الواتساب (بالصيغة الدولية، مثال: +20 100 123 4567)</label>
                <input
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  required
                  placeholder="+20 100 123 4567"
                />
              </div>
              <div className="field">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>وقت الرد (عربي)</label>
                <input
                  value={form.responseTimeAr}
                  onChange={(e) => update("responseTimeAr", e.target.value)}
                  placeholder="عادة خلال 24 ساعة"
                />
              </div>
              <div className="field">
                <label>وقت الرد (إنجليزي)</label>
                <input
                  value={form.responseTimeEn}
                  onChange={(e) => update("responseTimeEn", e.target.value)}
                  placeholder="Usually within 24 hours"
                />
              </div>
              <div className="field">
                <label>رابط فيسبوك (اختياري)</label>
                <input
                  value={form.facebook ?? ""}
                  onChange={(e) => update("facebook", e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="field">
                <label>رابط إنستجرام (اختياري)</label>
                <input
                  value={form.instagram ?? ""}
                  onChange={(e) => update("instagram", e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
            <div className="save-bar">
              <button className="button button-primary" type="submit">
                <Save size={16} /> حفظ التعديلات
              </button>
              {status && <span className="status-message success" style={{ margin: 0 }}>{status}</span>}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
