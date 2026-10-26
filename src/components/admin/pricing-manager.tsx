"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "@/components/toast-provider";

type Item = {
  id: number;
  kind: "row" | "course";
  titleAr: string;
  titleEn: string;
  col2Ar: string;
  col2En: string;
  descAr: string;
  descEn: string;
  price: string;
  currency: string;
  unitAr: string;
  unitEn: string;
  sort: number;
  active: boolean;
};

const empty = (kind: "row" | "course") => ({
  kind,
  titleAr: "",
  titleEn: "",
  col2Ar: "",
  col2En: "",
  descAr: "",
  descEn: "",
  price: "",
  currency: "USD",
  unitAr: kind === "row" ? "/ شهر" : "/ حصة",
  unitEn: kind === "row" ? "/ Month" : "/ lesson",
  sort: 0,
  active: true,
});

export function PricingManager() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(empty("row"));
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/pricing").then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : []));
  }
  useEffect(load, []);

  function startNew(kind: "row" | "course") {
    const maxSort = Math.max(0, ...(items ?? []).map((i) => i.sort));
    setForm({ ...empty(kind), sort: maxSort + 1 });
    setEditing("new");
  }
  function startEdit(i: Item) {
    setForm({ ...i });
    setEditing(i.id);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editing === "new" ? "/api/admin/pricing" : `/api/admin/pricing/${editing}`, {
        method: editing === "new" ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return toast({ type: "error", title: "تعذر الحفظ", message: d.error });
      toast({ type: "success", title: "تم الحفظ ✓", message: "التعديل ظاهر في صفحة الأسعار." });
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(i: Item) {
    if (!confirm(`حذف "${i.titleAr}"؟`)) return;
    await fetch(`/api/admin/pricing/${i.id}`, { method: "DELETE" });
    toast({ type: "success", title: "تم الحذف" });
    load();
  }

  const isCourse = form.kind === "course";
  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-toolbar">
          <div>
            <span className="section-label">PRICING</span>
            <h1 style={{ margin: "8px 0 0" }}>إدارة صفحة الأسعار</h1>
          </div>
          {editing === null && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="button button-primary" onClick={() => startNew("row")}><Plus size={16} /> إضافة سطر للجدول</button>
              <button className="button button-outline" onClick={() => startNew("course")}><Plus size={16} /> إضافة كورس</button>
            </div>
          )}
        </div>
        <p className="form-note">الأسطر بتظهر في جدول الأسعار، والكورسات بتظهر في كروت مميزة تحت الجدول. الترتيب بالرقم (الأصغر الأول).</p>

        {editing !== null && (
          <form className="admin-panel" onSubmit={submit}>
            <div className="admin-toolbar" style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>
                {editing === "new" ? "إضافة" : "تعديل"} {isCourse ? "كورس" : "سطر في الجدول"}
              </h2>
              <button type="button" className="btn-mini" onClick={() => setEditing(null)}><X size={14} /></button>
            </div>
            <div className="form-grid">
              <div className="field"><label>{isCourse ? "اسم الكورس (عربي)" : "الجدول / الأسبوع (عربي)"}</label><input required value={form.titleAr} onChange={(e) => set({ titleAr: e.target.value })} /></div>
              <div className="field"><label>{isCourse ? "Course name (English)" : "Schedule / Week (English)"}</label><input required value={form.titleEn} onChange={(e) => set({ titleEn: e.target.value })} /></div>
              <div className="field"><label>{isCourse ? "مدة الحصة (عربي)" : "عدد الحصص في الشهر (عربي)"}</label><input value={form.col2Ar} onChange={(e) => set({ col2Ar: e.target.value })} /></div>
              <div className="field"><label>{isCourse ? "Lesson length (English)" : "Classes per month (English)"}</label><input value={form.col2En} onChange={(e) => set({ col2En: e.target.value })} /></div>
              {isCourse && (
                <>
                  <div className="field"><label>الوصف (عربي)</label><textarea rows={3} value={form.descAr} onChange={(e) => set({ descAr: e.target.value })} /></div>
                  <div className="field"><label>Description (English)</label><textarea rows={3} value={form.descEn} onChange={(e) => set({ descEn: e.target.value })} /></div>
                </>
              )}
              <div className="field"><label>السعر</label><input required type="number" step="0.01" value={form.price} onChange={(e) => set({ price: e.target.value })} /></div>
              <div className="field"><label>العملة</label><input value={form.currency} onChange={(e) => set({ currency: e.target.value })} /></div>
              <div className="field"><label>الوحدة بعد السعر (عربي)</label><input value={form.unitAr} onChange={(e) => set({ unitAr: e.target.value })} /></div>
              <div className="field"><label>Unit after price (English)</label><input value={form.unitEn} onChange={(e) => set({ unitEn: e.target.value })} /></div>
              <div className="field"><label>الترتيب</label><input type="number" value={form.sort} onChange={(e) => set({ sort: Number(e.target.value) })} /></div>
              <div className="field"><label className="toggle-row"><input type="checkbox" checked={form.active} onChange={(e) => set({ active: e.target.checked })} /> ظاهر في الموقع</label></div>
            </div>
            <button className="button button-primary" disabled={saving} style={{ marginTop: 12 }}>{saving ? "..." : "حفظ"}</button>
          </form>
        )}

        <div className="admin-panel admin-table-wrap">
          {items === null ? (
            <p className="form-note">جاري التحميل...</p>
          ) : items.length === 0 ? (
            <p className="form-note">مفيش أسعار لسه. اضغط «إضافة سطر للجدول».</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>النوع</th><th>الاسم</th><th>التفاصيل</th><th>السعر</th><th>الترتيب</th><th>الحالة</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>{i.kind === "course" ? "كورس" : "جدول"}</td>
                    <td>{i.titleAr}</td>
                    <td>{i.col2Ar || "—"}</td>
                    <td>{Number(i.price)} {i.currency} {i.unitAr}</td>
                    <td>{i.sort}</td>
                    <td>{i.active ? "ظاهر" : "مخفي"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button className="btn-mini" onClick={() => startEdit(i)}><Pencil size={14} /></button>{" "}
                      <button className="btn-mini" onClick={() => remove(i)}><Trash2 size={14} /></button>
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
