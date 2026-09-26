"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Pencil, Trash2, X, Eye } from "lucide-react";

type Post = {
  id: number;
  slug: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  coverImageUrl: string | null;
  published: boolean;
  createdAt: string;
};

const empty = {
  slug: "",
  titleAr: "",
  titleEn: "",
  excerptAr: "",
  excerptEn: "",
  contentAr: "",
  contentEn: "",
  coverImageUrl: "",
  published: false,
};

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 100);
}

export function PostsManager() {
  const [rows, setRows] = useState<Post[] | null>(null);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  function load() {
    fetch("/api/admin/posts").then((r) => r.json()).then(setRows);
  }
  useEffect(load, []);

  function startNew() {
    setForm(empty);
    setSlugTouched(false);
    setError("");
    setEditingId("new");
  }
  function startEdit(p: Post) {
    setForm({
      slug: p.slug,
      titleAr: p.titleAr,
      titleEn: p.titleEn,
      excerptAr: p.excerptAr,
      excerptEn: p.excerptEn,
      contentAr: p.contentAr,
      contentEn: p.contentEn,
      coverImageUrl: p.coverImageUrl || "",
      published: p.published,
    });
    setSlugTouched(true);
    setError("");
    setEditingId(p.id);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const method = editingId === "new" ? "POST" : "PATCH";
    const url = editingId === "new" ? "/api/admin/posts" : `/api/admin/posts/${editingId}`;
    const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "حدث خطأ");
      return;
    }
    setEditingId(null);
    load();
  }

  async function remove(id: number) {
    if (!confirm("هل تريد حذف هذا المقال نهائيًا؟")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
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
            <span className="section-label">المقالات</span>
            <h1 style={{ margin: "8px 0 0" }}>مدونة الأكاديمية</h1>
          </div>
          {editingId === null && (
            <button className="button button-primary" onClick={startNew}>
              <Plus size={16} /> مقال جديد
            </button>
          )}
        </div>

        {editingId !== null && (
          <form className="admin-panel" onSubmit={submit}>
            <div className="admin-toolbar" style={{ marginBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>{editingId === "new" ? "إضافة مقال جديد" : "تعديل المقال"}</h2>
              <button type="button" className="btn-mini" onClick={() => setEditingId(null)}>
                <X size={14} />
              </button>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>العنوان (عربي)</label>
                <input
                  required
                  value={form.titleAr}
                  onChange={(e) => {
                    const titleAr = e.target.value;
                    setForm((f) => ({ ...f, titleAr, slug: slugTouched ? f.slug : slugify(titleAr) }));
                  }}
                />
              </div>
              <div className="field">
                <label>Title (English)</label>
                <input required value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
              </div>
              <div className="field full">
                <label>المعرف في الرابط (slug)</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm({ ...form, slug: slugify(e.target.value) });
                  }}
                />
              </div>
              <div className="field full">
                <label>ملخص قصير (عربي)</label>
                <textarea required value={form.excerptAr} onChange={(e) => setForm({ ...form, excerptAr: e.target.value })} />
              </div>
              <div className="field full">
                <label>Short excerpt (English)</label>
                <textarea required value={form.excerptEn} onChange={(e) => setForm({ ...form, excerptEn: e.target.value })} />
              </div>
              <div className="field full">
                <label>محتوى المقال الكامل (عربي)</label>
                <textarea required rows={10} value={form.contentAr} onChange={(e) => setForm({ ...form, contentAr: e.target.value })} />
              </div>
              <div className="field full">
                <label>Full content (English)</label>
                <textarea required rows={10} value={form.contentEn} onChange={(e) => setForm({ ...form, contentEn: e.target.value })} />
              </div>
              <div className="field full">
                <label>رابط صورة الغلاف (اختياري)</label>
                <input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="field">
                <label className="toggle-row">
                  <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                  منشور (ظاهر للزوار)
                </label>
              </div>
            </div>
            {error && <div className="status-message error">{error}</div>}
            <div className="save-bar">
              <button className="button button-primary" type="submit">حفظ</button>
            </div>
          </form>
        )}

        <div className="admin-table-wrap" style={{ marginTop: 26 }}>
          {rows === null ? (
            <div className="admin-empty">جاري التحميل...</div>
          ) : rows.length === 0 ? (
            <div className="admin-empty">لا توجد مقالات بعد.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>الرابط</th>
                  <th>الحالة</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>{p.titleAr}</td>
                    <td>/blog/{p.slug}</td>
                    <td>
                      <span className={`pill-status ${p.published ? "pill-approved" : "pill-pending"}`}>
                        {p.published ? "منشور" : "مسودة"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        {p.published && (
                          <a className="btn-mini" href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">
                            <Eye size={12} />
                          </a>
                        )}
                        <button className="btn-mini" onClick={() => startEdit(p)}>
                          <Pencil size={12} />
                        </button>
                        <button className="btn-mini danger" onClick={() => remove(p.id)}>
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
