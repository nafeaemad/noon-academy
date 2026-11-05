"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, X, Percent, DollarSign } from "lucide-react";
import { toast } from "@/components/toast-provider";
import { DiscountView } from "@/components/discount-banner";
import { discountBadge } from "@/lib/discount";

type Targets = { programs: number[]; plans: number[]; items: number[] };
type Opt = { id: number; label: string };
const noTargets: Targets = { programs: [], plans: [], items: [] };

type Row = {
  id: number;
  type: "percent" | "fixed";
  value: string;
  labelAr: string;
  labelEn: string;
  messageAr: string;
  messageEn: string;
  startsAt: string | null;
  endsAt: string | null;
  scope: "all" | "selected";
  targets: Targets | null;
  sort: number;
  active: boolean;
};

const emptyForm = {
  type: "percent" as "percent" | "fixed",
  value: "",
  labelAr: "",
  labelEn: "",
  messageAr: "",
  messageEn: "",
  startsAt: "",
  endsAt: "",
  scope: "all" as "all" | "selected",
  targets: noTargets,
  sort: 0,
  active: true,
};

// <input type="datetime-local"> works in local time; the API stores ISO.
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : "");

export function DiscountsManager() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [opts, setOpts] = useState<{ programs: Opt[]; plans: Opt[]; items: Opt[] }>({ programs: [], plans: [], items: [] });

  function load() {
    fetch("/api/admin/discounts").then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : []));
  }
  useEffect(load, []);
  useEffect(() => {
    const get = (u: string) => fetch(u).then((r) => r.json()).then((d) => (Array.isArray(d) ? d : [])).catch(() => []);
    Promise.all([get("/api/admin/programs"), get("/api/admin/plans"), get("/api/admin/pricing")]).then(([pr, pl, it]) =>
      setOpts({
        programs: pr.map((x: { id: number; titleAr: string }) => ({ id: x.id, label: x.titleAr })),
        plans: pl.map((x: { id: number; nameAr: string }) => ({ id: x.id, label: x.nameAr })),
        items: it.map((x: { id: number; titleAr: string }) => ({ id: x.id, label: x.titleAr })),
      }),
    );
  }, []);

  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });

  function startEdit(r: Row) {
    setForm({ ...r, scope: r.scope ?? "all", targets: { ...noTargets, ...(r.targets ?? {}) }, startsAt: toLocalInput(r.startsAt), endsAt: toLocalInput(r.endsAt) });
    setEditing(r.id);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editing === "new" ? "/api/admin/discounts" : `/api/admin/discounts/${editing}`, {
        method: editing === "new" ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, startsAt: fromLocalInput(form.startsAt), endsAt: fromLocalInput(form.endsAt) }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return toast({ type: "error", title: "تعذر الحفظ", message: d.error });
      toast({ type: "success", title: "تم حفظ الخصم ✓", message: "بيظهر في الموقع لو مفعّل وفي نطاق التاريخ." });
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(r: Row) {
    if (!confirm("حذف الخصم ده؟")) return;
    await fetch(`/api/admin/discounts/${r.id}`, { method: "DELETE" });
    toast({ type: "success", title: "تم الحذف" });
    load();
  }

  async function toggle(r: Row) {
    await fetch(`/api/admin/discounts/${r.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...r, active: !r.active }),
    });
    load();
  }

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-toolbar">
          <div>
            <span className="section-label">DISCOUNTS</span>
            <h1 style={{ margin: "8px 0 0" }}>الخصومات والعروض</h1>
          </div>
          {editing === null && (
            <button className="button button-primary" onClick={() => { setForm({ ...emptyForm, sort: (rows?.length ?? 0) + 1 }); setEditing("new"); }}>
              <Plus size={16} /> خصم جديد
            </button>
          )}
        </div>
        <p className="form-note">
          الخصم الشغّال بيتطبق على كل الأسعار في الموقع (الجدول والكورسات والخطط) وبيظهر كبانر مميز فوق وشارة على كل برنامج. لو فيه أكتر من خصم مفعّل، الأول في الترتيب هو اللي بيشتغل.
          الخصم النقدي بيتخصم من كل سعر.
        </p>

        {editing !== null && (
          <form className="admin-panel" onSubmit={submit}>
            <div className="admin-toolbar" style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>{editing === "new" ? "إضافة خصم" : "تعديل الخصم"}</h2>
              <button type="button" className="btn-mini" onClick={() => setEditing(null)}><X size={14} /></button>
            </div>

            <div className="field">
              <label>نوع الخصم</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className={`btn-mini${form.type === "percent" ? " active" : ""}`} style={form.type === "percent" ? { background: "var(--green)", color: "#fff" } : undefined} onClick={() => set({ type: "percent" })}>
                  <Percent size={14} /> نسبة مئوية %
                </button>
                <button type="button" className={`btn-mini${form.type === "fixed" ? " active" : ""}`} style={form.type === "fixed" ? { background: "var(--green)", color: "#fff" } : undefined} onClick={() => set({ type: "fixed" })}>
                  <DollarSign size={14} /> مبلغ نقدي
                </button>
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: 12 }}>
              <div className="field">
                <label>{form.type === "percent" ? "النسبة (من 1 إلى 100)" : "المبلغ المخصوم (بالدولار)"}</label>
                <input required type="number" min="0" max={form.type === "percent" ? 100 : undefined} step="0.01" value={form.value} onChange={(e) => set({ value: e.target.value })} />
              </div>
              <div className="field">
                <label>الترتيب</label>
                <input type="number" value={form.sort} onChange={(e) => set({ sort: Number(e.target.value) })} />
              </div>
              <div className="field"><label>عنوان العرض (عربي)</label><input value={form.labelAr} onChange={(e) => set({ labelAr: e.target.value })} placeholder="مثال: عرض الجمعة البيضاء" /></div>
              <div className="field"><label>Offer title (English)</label><input value={form.labelEn} onChange={(e) => set({ labelEn: e.target.value })} placeholder="e.g. Black Friday offer" /></div>
              <div className="field"><label>النص (عربي) — اكتب أي كلام تحبه</label><textarea rows={3} value={form.messageAr} onChange={(e) => set({ messageAr: e.target.value })} /></div>
              <div className="field"><label>Message (English) — اختياري، لو فاضي بيظهر العربي</label><textarea rows={3} value={form.messageEn} onChange={(e) => set({ messageEn: e.target.value })} /></div>
              <div className="field"><label>يبدأ من (اختياري)</label><input type="datetime-local" value={form.startsAt} onChange={(e) => set({ startsAt: e.target.value })} /></div>
              <div className="field"><label>ينتهي في (اختياري — بيظهر عدّاد تنازلي)</label><input type="datetime-local" value={form.endsAt} onChange={(e) => set({ endsAt: e.target.value })} /></div>
              <div className="field"><label className="toggle-row"><input type="checkbox" checked={form.active} onChange={(e) => set({ active: e.target.checked })} /> مفعّل</label></div>
            </div>

            <div className="field" style={{ marginTop: 12 }}>
              <label>بيتطبق على إيه؟</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" className="btn-mini" style={form.scope === "all" ? { background: "var(--green)", color: "#fff" } : undefined} onClick={() => set({ scope: "all" })}>الكل (كل البرامج والأسعار)</button>
                <button type="button" className="btn-mini" style={form.scope === "selected" ? { background: "var(--green)", color: "#fff" } : undefined} onClick={() => set({ scope: "selected" })}>اختيار محدد</button>
              </div>
            </div>
            {form.scope === "selected" && (
              <div className="admin-panel" style={{ marginTop: 10, background: "#fbfaf6" }}>
                {([["programs", "البرامج"], ["plans", "خطط الأسعار"], ["items", "أسطر وكورسات صفحة الأسعار"]] as const).map(([k, title]) => (
                  <div key={k} style={{ marginBottom: 10 }}>
                    <strong style={{ fontSize: 13 }}>{title}</strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                      {opts[k].length === 0 && <span className="form-note">مفيش عناصر.</span>}
                      {opts[k].map((o) => {
                        const on = form.targets[k].includes(o.id);
                        return (
                          <label key={o.id} className="toggle-row" style={{ border: "1px solid #d9d2bf", borderRadius: 20, padding: "5px 12px", background: on ? "#e9f4ee" : "#fff" }}>
                            <input type="checkbox" checked={on} onChange={() => set({ targets: { ...form.targets, [k]: on ? form.targets[k].filter((x) => x !== o.id) : [...form.targets[k], o.id] } })} /> {o.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <p className="form-note">العميل لما يضغط على الخصم ده في البانر هيشوف العناصر اللي اخترتها. اختار برنامج أو خطة واحدة على الأقل.</p>
              </div>
            )}

            <p className="form-note" style={{ marginTop: 14 }}>معاينة الشكل اللي هيظهر للزوار:</p>
            <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
              <DiscountView
                d={{ type: form.type, value: form.value || "0", labelAr: form.labelAr, labelEn: form.labelEn, messageAr: form.messageAr, messageEn: form.messageEn, endsAt: form.endsAt ? fromLocalInput(form.endsAt) : null }}
                isArabic
                cta={false}
              />
            </div>
            <button className="button button-primary" disabled={saving}>{saving ? "..." : "حفظ"}</button>
          </form>
        )}

        <div className="admin-panel admin-table-wrap">
          {rows === null ? (
            <p className="form-note">جاري التحميل...</p>
          ) : rows.length === 0 ? (
            <p className="form-note">مفيش خصومات لسه. اضغط «خصم جديد».</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>الخصم</th><th>العنوان</th><th>بيتطبق على</th><th>الفترة</th><th>الحالة</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><strong style={{ direction: "ltr", display: "inline-block" }}>{discountBadge(r)}</strong></td>
                    <td>{r.labelAr || "—"}</td>
                    <td style={{ fontSize: 12 }}>{r.scope === "selected" ? `${(r.targets?.programs.length ?? 0)} برنامج · ${(r.targets?.plans.length ?? 0)} خطة · ${(r.targets?.items.length ?? 0)} سطر` : "الكل"}</td>
                    <td style={{ fontSize: 12 }}>
                      {r.startsAt ? new Date(r.startsAt).toLocaleString("ar-EG") : "من الآن"} ← {r.endsAt ? new Date(r.endsAt).toLocaleString("ar-EG") : "مفتوح"}
                    </td>
                    <td>
                      <button className="btn-mini" onClick={() => toggle(r)}>{r.active ? "مفعّل ✓" : "متوقف"}</button>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button className="btn-mini" onClick={() => startEdit(r)}><Pencil size={14} /></button>{" "}
                      <button className="btn-mini" onClick={() => remove(r)}><Trash2 size={14} /></button>
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
