"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { normalizePhone } from "@/lib/phone";
import { toast } from "@/components/toast-provider";
import { DEFAULT_STUDENT_MSG, DEFAULT_TEACHER_MSG, PLACEHOLDERS, fillTemplate } from "@/lib/reminder-templates";

type Row = {
  id: number;
  reference: string;
  studentName: string;
  studentPhone: string;
  startsAt: string;
  timezone: string;
  teacherName: string | null;
  teacherPhone: string | null;
  meetingLink: string | null;
};

function wa(phone: string | null, text: string) {
  const n = phone ? normalizePhone(phone) : null;
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

export function RemindersManager() {
  const [rows, setRows] = useState<Row[] | null>(null);
  // Saved custom messages (null = use the default). The textareas hold the draft being edited.
  const [saved, setSaved] = useState<{ student: string | null; teacher: string | null }>({ student: null, teacher: null });
  const [studentDraft, setStudentDraft] = useState(DEFAULT_STUDENT_MSG);
  const [teacherDraft, setTeacherDraft] = useState(DEFAULT_TEACHER_MSG);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetch("/api/admin/reminders/templates").then((r) => r.json()).then((d) => {
      setSaved({ student: d.student ?? null, teacher: d.teacher ?? null });
      setStudentDraft(d.student ?? DEFAULT_STUDENT_MSG);
      setTeacherDraft(d.teacher ?? DEFAULT_TEACHER_MSG);
    });
  }, []);

  async function saveTemplates(student: string | null, teacher: string | null) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/reminders/templates", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ student, teacher }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return toast({ type: "error", title: "تعذر الحفظ", message: d.error });
      setSaved({ student: d.student, teacher: d.teacher });
      setStudentDraft(d.student ?? DEFAULT_STUDENT_MSG);
      setTeacherDraft(d.teacher ?? DEFAULT_TEACHER_MSG);
      toast({ type: "success", title: "تم حفظ الرسائل ✓" });
    } finally {
      setSaving(false);
    }
  }
  const isDefault = (draft: string, def: string) => draft.trim() === def;
  const toSave = (draft: string, def: string) => (isDefault(draft, def) ? null : draft);

  useEffect(() => {
    fetch("/api/admin/reminders").then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : []));
  }, []);

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <h1>تذكيرات الحصص (واتساب)</h1>
        <p className="form-note">كل الحصص المؤكدة الجاية (الأقرب أولًا). اضغط الزر وهيفتح واتساب برسالة جاهزة، وانت بتدوس إرسال.</p>
        <div className="admin-panel">
          <strong style={{ fontSize: 15 }}>نص رسائل التذكير</strong>
          <p className="form-note">
            لو عدّلت الرسالة وحفظتها، التعديل هو اللي هيتبعت. ولو سبتها زي ما هي، بتتبعت الرسالة الافتراضية. المتغيرات (بتتبدل تلقائيًا): {PLACEHOLDERS.join("  ")}
          </p>
          <div className="form-grid" style={{ marginTop: 10 }}>
            <div className="field">
              <label>رسالة الطلاب {saved.student ? "(معدّلة)" : "(افتراضية)"}</label>
              <textarea rows={6} value={studentDraft} onChange={(e) => setStudentDraft(e.target.value)} />
            </div>
            <div className="field">
              <label>رسالة المعلمين {saved.teacher ? "(معدّلة)" : "(افتراضية)"}</label>
              <textarea rows={6} value={teacherDraft} onChange={(e) => setTeacherDraft(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <button className="btn-mini" disabled={saving} onClick={() => saveTemplates(toSave(studentDraft, DEFAULT_STUDENT_MSG), toSave(teacherDraft, DEFAULT_TEACHER_MSG))}>
              حفظ الرسائل
            </button>
            <button className="btn-mini" disabled={saving} onClick={() => saveTemplates(null, null)}>
              الرجوع للرسائل الافتراضية
            </button>
          </div>
        </div>
        {rows === null ? (
          <p className="form-note">جاري التحميل...</p>
        ) : rows.length === 0 ? (
          <p className="form-note">مفيش حصص مؤكدة جاية. تأكد إن حالة الحجز «مؤكد» من إدارة الحجوزات.</p>
        ) : (
          <div className="admin-panel admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>الموعد</th><th>الطالب</th><th>المدرس</th><th>تذكير</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const time = new Date(r.startsAt).toLocaleString("ar-EG", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: r.timezone || "Africa/Cairo" });
                  const studentTpl = saved.student ?? DEFAULT_STUDENT_MSG;
                  const teacherTpl = saved.teacher ?? DEFAULT_TEACHER_MSG;
                  const origin = typeof window !== "undefined" ? window.location.origin : "";
                  const student = wa(r.studentPhone, fillTemplate(studentTpl, { name: r.studentName, other: r.teacherName || "المدرس", time, ref: r.reference, link: `${origin}/account` }));
                  const teacher = wa(r.teacherPhone, fillTemplate(teacherTpl, { name: r.teacherName || "", other: r.studentName, time, ref: r.reference, link: r.meetingLink || `${origin}/teacher` }));
                  return (
                    <tr key={r.id}>
                      <td>{time}</td>
                      <td>{r.studentName}</td>
                      <td>{r.teacherName || "—"}</td>
                      <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {student ? <a className="btn-mini" href={student} target="_blank" rel="noreferrer"><MessageCircle size={14} /> للطالب</a> : <span>رقم الطالب غلط</span>}
                        {teacher ? <a className="btn-mini" href={teacher} target="_blank" rel="noreferrer"><MessageCircle size={14} /> للمدرس</a> : <span>مفيش رقم للمدرس</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
