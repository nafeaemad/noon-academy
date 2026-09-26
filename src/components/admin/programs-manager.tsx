"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Pencil, Trash2, X } from "lucide-react";

type Program = {
  id: number;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  levelAr: string;
  levelEn: string;
  ageAr: string;
  ageEn: string;
  duration: number;
  active: boolean;
  sortOrder: number;
};

type Plan = {
  id: number;
  nameAr: string;
  nameEn: string;
  lessonCount: number;
  duration: number;
  price: string;
  currency: string;
  active: boolean;
};

const emptyProgram = {
  slug: "",
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  levelAr: "",
  levelEn: "",
  ageAr: "",
  ageEn: "",
  duration: "30",
  active: true,
  sortOrder: "0",
};

const emptyPlan = {
  nameAr: "",
  nameEn: "",
  lessonCount: "8",
  duration: "30",
  price: "0",
  currency: "USD",
  active: true,
};

export function ProgramsManager() {
  const [tab, setTab] = useState<"programs" | "plans">("programs");

  const [programs, setPrograms] = useState<Program[] | null>(null);
  const [editingProgram, setEditingProgram] = useState<number | "new" | null>(null);
  const [programForm, setProgramForm] = useState(emptyProgram);

  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [editingPlan, setEditingPlan] = useState<number | "new" | null>(null);
  const [planForm, setPlanForm] = useState(emptyPlan);

  function loadPrograms() {
    fetch("/api/admin/programs").then((r) => r.json()).then(setPrograms);
  }
  function loadPlans() {
    fetch("/api/admin/plans").then((r) => r.json()).then(setPlans);
  }
  useEffect(() => {
    loadPrograms();
    loadPlans();
  }, []);

  function startNewProgram() {
    setProgramForm(emptyProgram);
    setEditingProgram("new");
  }
  function startEditProgram(p: Program) {
    setProgramForm({
      slug: p.slug,
      titleAr: p.titleAr,
      titleEn: p.titleEn,
      descriptionAr: p.descriptionAr,
      descriptionEn: p.descriptionEn,
      levelAr: p.levelAr,
      levelEn: p.levelEn,
      ageAr: p.ageAr,
      ageEn: p.ageEn,
      duration: String(p.duration),
      active: p.active,
      sortOrder: String(p.sortOrder),
    });
    setEditingProgram(p.id);
  }
  async function submitProgram(e: FormEvent) {
    e.preventDefault();
    const method = editingProgram === "new" ? "POST" : "PATCH";
    const url = editingProgram === "new" ? "/api/admin/programs" : `/api/admin/programs/${editingProgram}`;
    await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(programForm) });
    setEditingProgram(null);
    loadPrograms();
  }
  async function removeProgram(id: number) {
    if (!confirm("هل تريد حذف هذا البرنامج؟")) return;
    await fetch(`/api/admin/programs/${id}`, { method: "DELETE" });
    loadPrograms();
  }

  function startNewPlan() {
    setPlanForm(emptyPlan);
    setEditingPlan("new");
  }
  function startEditPlan(p: Plan) {
    setPlanForm({
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      lessonCount: String(p.lessonCount),
      duration: String(p.duration),
      price: p.price,
      currency: p.currency,
      active: p.active,
    });
    setEditingPlan(p.id);
  }
  async function submitPlan(e: FormEvent) {
    e.preventDefault();
    const method = editingPlan === "new" ? "POST" : "PATCH";
    const url = editingPlan === "new" ? "/api/admin/plans" : `/api/admin/plans/${editingPlan}`;
    await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(planForm) });
    setEditingPlan(null);
    loadPlans();
  }
  async function removePlan(id: number) {
    if (!confirm("هل تريد حذف هذه الخطة؟")) return;
    await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    loadPlans();
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <span className="section-label">البرامج والخطط والأسعار</span>
        <h1>البرامج والأسعار</h1>

        <div className="filter-row" style={{ justifyContent: "flex-start", margin: "20px 0" }}>
          <button className={tab === "programs" ? "active" : ""} onClick={() => setTab("programs")}>البرامج التعليمية</button>
          <button className={tab === "plans" ? "active" : ""} onClick={() => setTab("plans")}>خطط الأسعار</button>
        </div>

        {tab === "programs" && (
          <>
            <div className="admin-toolbar">
              <p style={{ margin: 0 }}>البرامج التعليمية اللي بتظهر في الصفحة الرئيسية وصفحة البرامج.</p>
              {editingProgram === null && (
                <button className="button button-primary" onClick={startNewProgram}><Plus size={16} /> إضافة برنامج</button>
              )}
            </div>

            {editingProgram !== null && (
              <form className="admin-panel" onSubmit={submitProgram}>
                <div className="admin-toolbar" style={{ marginBottom: 10 }}>
                  <h2 style={{ margin: 0, fontSize: 16 }}>{editingProgram === "new" ? "إضافة برنامج جديد" : "تعديل البرنامج"}</h2>
                  <button type="button" className="btn-mini" onClick={() => setEditingProgram(null)}><X size={14} /></button>
                </div>
                <div className="form-grid">
                  <div className="field"><label>المعرف (slug, إنجليزي بدون مسافات)</label><input required value={programForm.slug} onChange={(e) => setProgramForm({ ...programForm, slug: e.target.value })} /></div>
                  <div className="field"><label>مدة الحصة (بالدقائق)</label><input type="number" value={programForm.duration} onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })} /></div>
                  <div className="field"><label>العنوان (عربي)</label><input required value={programForm.titleAr} onChange={(e) => setProgramForm({ ...programForm, titleAr: e.target.value })} /></div>
                  <div className="field"><label>Title (English)</label><input required value={programForm.titleEn} onChange={(e) => setProgramForm({ ...programForm, titleEn: e.target.value })} /></div>
                  <div className="field full"><label>الوصف (عربي)</label><textarea required value={programForm.descriptionAr} onChange={(e) => setProgramForm({ ...programForm, descriptionAr: e.target.value })} /></div>
                  <div className="field full"><label>Description (English)</label><textarea required value={programForm.descriptionEn} onChange={(e) => setProgramForm({ ...programForm, descriptionEn: e.target.value })} /></div>
                  <div className="field"><label>المستوى (عربي)</label><input required value={programForm.levelAr} onChange={(e) => setProgramForm({ ...programForm, levelAr: e.target.value })} /></div>
                  <div className="field"><label>Level (English)</label><input required value={programForm.levelEn} onChange={(e) => setProgramForm({ ...programForm, levelEn: e.target.value })} /></div>
                  <div className="field"><label>الفئة العمرية (عربي)</label><input required value={programForm.ageAr} onChange={(e) => setProgramForm({ ...programForm, ageAr: e.target.value })} /></div>
                  <div className="field"><label>Age (English)</label><input required value={programForm.ageEn} onChange={(e) => setProgramForm({ ...programForm, ageEn: e.target.value })} /></div>
                  <div className="field"><label>ترتيب الظهور</label><input type="number" value={programForm.sortOrder} onChange={(e) => setProgramForm({ ...programForm, sortOrder: e.target.value })} /></div>
                  <div className="field"><label className="toggle-row"><input type="checkbox" checked={programForm.active} onChange={(e) => setProgramForm({ ...programForm, active: e.target.checked })} /> ظاهر في الموقع</label></div>
                </div>
                <div className="save-bar"><button className="button button-primary" type="submit">حفظ</button></div>
              </form>
            )}

            <div className="admin-table-wrap">
              {programs === null ? (
                <div className="admin-empty">جاري التحميل...</div>
              ) : programs.length === 0 ? (
                <div className="admin-empty">لا توجد برامج بعد.</div>
              ) : (
                <table className="admin-table">
                  <thead><tr><th>العنوان</th><th>المستوى</th><th>الفئة العمرية</th><th>المدة</th><th>الحالة</th><th>إجراء</th></tr></thead>
                  <tbody>
                    {programs.map((p) => (
                      <tr key={p.id}>
                        <td>{p.titleAr}</td>
                        <td>{p.levelAr}</td>
                        <td>{p.ageAr}</td>
                        <td>{p.duration} دقيقة</td>
                        <td><span className={`pill-status ${p.active ? "pill-approved" : "pill-rejected"}`}>{p.active ? "ظاهر" : "مخفي"}</span></td>
                        <td>
                          <div className="admin-actions">
                            <button className="btn-mini" onClick={() => startEditProgram(p)}><Pencil size={12} /></button>
                            <button className="btn-mini danger" onClick={() => removeProgram(p.id)}><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {tab === "plans" && (
          <>
            <div className="admin-toolbar">
              <p style={{ margin: 0 }}>خطط الأسعار اللي بتظهر في صفحة الأسعار.</p>
              {editingPlan === null && (
                <button className="button button-primary" onClick={startNewPlan}><Plus size={16} /> إضافة خطة</button>
              )}
            </div>

            {editingPlan !== null && (
              <form className="admin-panel" onSubmit={submitPlan}>
                <div className="admin-toolbar" style={{ marginBottom: 10 }}>
                  <h2 style={{ margin: 0, fontSize: 16 }}>{editingPlan === "new" ? "إضافة خطة جديدة" : "تعديل الخطة"}</h2>
                  <button type="button" className="btn-mini" onClick={() => setEditingPlan(null)}><X size={14} /></button>
                </div>
                <div className="form-grid">
                  <div className="field"><label>الاسم (عربي)</label><input required value={planForm.nameAr} onChange={(e) => setPlanForm({ ...planForm, nameAr: e.target.value })} /></div>
                  <div className="field"><label>Name (English)</label><input required value={planForm.nameEn} onChange={(e) => setPlanForm({ ...planForm, nameEn: e.target.value })} /></div>
                  <div className="field"><label>عدد الحصص</label><input type="number" value={planForm.lessonCount} onChange={(e) => setPlanForm({ ...planForm, lessonCount: e.target.value })} /></div>
                  <div className="field"><label>مدة الحصة (دقائق)</label><input type="number" value={planForm.duration} onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })} /></div>
                  <div className="field"><label>السعر</label><input type="number" step="0.01" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} /></div>
                  <div className="field"><label>العملة</label><input value={planForm.currency} onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })} /></div>
                  <div className="field"><label className="toggle-row"><input type="checkbox" checked={planForm.active} onChange={(e) => setPlanForm({ ...planForm, active: e.target.checked })} /> ظاهرة في الموقع</label></div>
                </div>
                <div className="save-bar"><button className="button button-primary" type="submit">حفظ</button></div>
              </form>
            )}

            <div className="admin-table-wrap">
              {plans === null ? (
                <div className="admin-empty">جاري التحميل...</div>
              ) : plans.length === 0 ? (
                <div className="admin-empty">لا توجد خطط بعد.</div>
              ) : (
                <table className="admin-table">
                  <thead><tr><th>الاسم</th><th>عدد الحصص</th><th>السعر</th><th>الحالة</th><th>إجراء</th></tr></thead>
                  <tbody>
                    {plans.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nameAr}</td>
                        <td>{p.lessonCount}</td>
                        <td>{p.price} {p.currency}</td>
                        <td><span className={`pill-status ${p.active ? "pill-approved" : "pill-rejected"}`}>{p.active ? "ظاهرة" : "مخفية"}</span></td>
                        <td>
                          <div className="admin-actions">
                            <button className="btn-mini" onClick={() => startEditPlan(p)}><Pencil size={12} /></button>
                            <button className="btn-mini danger" onClick={() => removePlan(p.id)}><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
