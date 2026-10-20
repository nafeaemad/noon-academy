"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { normalizePhone } from "@/lib/phone";

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
        {rows === null ? (
          <p className="form-note">جاري التحميل...</p>
        ) : rows.length === 0 ? (
          <p className="form-note">مفيش حصص مؤكدة جاية. تأكد إن حالة الحجز "مؤكد" من إدارة الحجوزات.</p>
        ) : (
          <div className="admin-panel admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>الموعد</th><th>الطالب</th><th>المدرس</th><th>تذكير</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const time = new Date(r.startsAt).toLocaleString("ar-EG", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: r.timezone || "Africa/Cairo" });
                  const student = wa(r.studentPhone, `السلام عليكم ${r.studentName} 🌙\nتذكير: حصتك في نون أكاديمي (${r.reference}) بتبدأ ${time}.\nادخل من حسابك بربع ساعة قبلها: ${typeof window !== "undefined" ? window.location.origin : ""}/account`);
                  const teacher = wa(r.teacherPhone, `السلام عليكم ${r.teacherName || ""} 🌙\nتذكير: عندك حصة مع ${r.studentName} (${r.reference}) ${time}.${r.meetingLink ? `\nاللينك: ${r.meetingLink}` : ""}`);
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
