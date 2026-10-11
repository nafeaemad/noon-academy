"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Trash2, Reply, X, Send, Wallet } from "lucide-react";
import { toast } from "@/components/toast-provider";

type Booking = {
  id: number;
  userId: number | null;
  reference: string;
  program: string;
  level: string;
  age: number;
  teacherId: number | null;
  startsAt: string;
  duration: number;
  timezone: string;
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  creditedAt: string | null;
};

type Teacher = { id: number; nameAr: string; nameEn: string; meetingLink: string | null };

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  cancelled: "ملغي",
  completed: "مكتمل",
};

function defaultMessage(status: string, booking: Booking, teacherName: string, meetingLink?: string) {
  const date = new Date(booking.startsAt).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
  if (status === "confirmed") {
    if (teacherName && meetingLink) {
      return `تم تأكيد حجزك يوم ${date}. المدرس المسؤول عن حصتك: ${teacherName}. رابط الدخول للحصة: ${meetingLink}`;
    }
    return teacherName
      ? `تم تأكيد حجزك يوم ${date}. المدرس المسؤول عن حصتك: ${teacherName}. هنتواصل معك بتفاصيل الدخول للحصة قبل الموعد.`
      : `تم تأكيد حجزك يوم ${date}. هنتواصل معك بتفاصيل الدخول للحصة قبل الموعد.`;
  }
  if (status === "completed") {
    return "تم بحمد الله إكمال حصتك، سعدنا بوجودك معنا. لو حابب تكمل رحلتك معانا، تقدر تحجز حصة جديدة في أي وقت.";
  }
  if (status === "cancelled") {
    return `نأسف، تعذّر تأكيد حجزك يوم ${date}. تقدر تختار موعدًا آخر يناسبك من صفحة الحجز.`;
  }
  return "حجزك لسه قيد المراجعة، هنرد عليك قريبًا بتفاصيل الموعد.";
}

export function BookingsManager() {
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyStatus, setReplyStatus] = useState("confirmed");
  const [replyTeacher, setReplyTeacher] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState("");

  function load() {
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then(setRows);
  }

  useEffect(() => {
    load();
    fetch("/api/admin/teachers")
      .then((r) => r.json())
      .then(setTeachers);
  }, []);

  function teacherName(id: number | null) {
    const t = teachers.find((x) => x.id === id);
    return t ? t.nameAr : "";
  }

  function teacherLink(id: number | null) {
    const t = teachers.find((x) => x.id === id);
    return t?.meetingLink || undefined;
  }

  function openReply(b: Booking) {
    setReplyingId(b.id);
    setReplyStatus(b.status === "pending" ? "confirmed" : b.status);
    setReplyTeacher(b.teacherId ? String(b.teacherId) : "");
    setReplyMessage(defaultMessage(b.status === "pending" ? "confirmed" : b.status, b, teacherName(b.teacherId), teacherLink(b.teacherId)));
    setNote("");
  }

  function onStatusChange(status: string, booking: Booking) {
    setReplyStatus(status);
    const tid = replyTeacher ? Number(replyTeacher) : null;
    setReplyMessage(defaultMessage(status, booking, teacherName(tid), teacherLink(tid)));
  }

  function onTeacherChange(teacherId: string, booking: Booking) {
    setReplyTeacher(teacherId);
    const tid = teacherId ? Number(teacherId) : null;
    setReplyMessage(defaultMessage(replyStatus, booking, teacherName(tid), teacherLink(tid)));
  }

  async function sendReply(booking: Booking) {
    setSending(true);
    setNote("");
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/reply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: replyStatus, teacherId: replyTeacher || null, message: replyMessage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNote(data.error || "حدث خطأ");
        return;
      }
      setRows((prev) => prev?.map((b) => (b.id === booking.id ? { ...b, status: replyStatus as Booking["status"], teacherId: replyTeacher ? Number(replyTeacher) : null } : b)) ?? prev);
      setNote(data.hasAccount ? "تم الإرسال، وصل للطالب إشعار فوري ✓" : "تم تحديث الحجز (الطالب بدون حساب فمقدرناش نبعتله شات، تواصل معه بالواتساب).");
      setTimeout(() => setReplyingId(null), 1600);
    } finally {
      setSending(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("هل تريد حذف هذا الحجز نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    setRows((prev) => prev?.filter((b) => b.id !== id) ?? prev);
    await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
  }

  async function completeLesson(b: Booking) {
    if (!confirm(`تأكيد إن الحصة اتاخدت؟ هيتم قبض سعر الحصة للمدرس وخصم حصة من رصيد الطالب (${b.name}).`)) return;
    const res = await fetch(`/api/admin/bookings/${b.id}/complete-lesson`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      toast({ type: "error", title: "حدث خطأ", message: data.error || undefined });
      return;
    }
    setRows((prev) => prev?.map((row) => (row.id === b.id ? { ...row, status: "completed", creditedAt: new Date().toISOString() } : row)) ?? prev);
    toast({
      type: "success",
      title: "تم تسجيل الحصة كمكتملة ✓",
      message: data.debited ? "تم تسجيل القبض وخصم حصة من رصيد الطالب." : "تم تسجيل القبض للمدرس (الطالب بدون حساب فمفيش رصيد نخصم منه).",
    });
  }

  const replyingBooking = rows?.find((b) => b.id === replyingId) || null;

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <span className="section-label">إدارة الحجوزات والمواعيد</span>
        <h1>الحجوزات</h1>
        <p>كل طلبات الحجز اللي جاية من الموقع. دوس &quot;رد&quot; لتحديد المدرس والموعد وإرسال رد يوصل للطالب فورًا كإشعار.</p>

        {replyingBooking && (
          <div className="admin-panel" style={{ marginTop: 20 }}>
            <div className="admin-toolbar" style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: 14 }}>
                الرد على حجز {replyingBooking.reference} — {replyingBooking.name}
              </strong>
              <button className="btn-mini" onClick={() => setReplyingId(null)}>
                <X size={14} />
              </button>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>حالة الحجز</label>
                <select value={replyStatus} onChange={(e) => onStatusChange(e.target.value, replyingBooking)}>
                  <option value="pending">قيد الانتظار</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغي / مرفوض</option>
                </select>
              </div>
              <div className="field">
                <label>المدرس المسؤول (اختياري)</label>
                <select value={replyTeacher} onChange={(e) => onTeacherChange(e.target.value, replyingBooking)}>
                  <option value="">بدون تحديد</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field full">
                <label>الرسالة اللي هتوصل للطالب (تقدر تعدّل فيها بحرية)</label>
                <textarea rows={4} value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} />
              </div>
            </div>
            {!replyingBooking.userId && (
              <div className="status-message" style={{ color: "#9d6b0c" }}>
                هذا الحجز بدون حساب مسجّل، فالرسالة مش هتوصله شات ولا إشعار — لازم تتواصل معاه بالواتساب مباشرة.
              </div>
            )}
            <div className="save-bar">
              <button className="button button-primary" onClick={() => sendReply(replyingBooking)} disabled={sending}>
                <Send size={16} /> {sending ? "جاري الإرسال..." : "إرسال الرد"}
              </button>
              {note && <span className="status-message success" style={{ margin: 0 }}>{note}</span>}
            </div>
          </div>
        )}

        <div className="admin-table-wrap" style={{ marginTop: 26 }}>
          {rows === null ? (
            <div className="admin-empty">جاري التحميل...</div>
          ) : rows.length === 0 ? (
            <div className="admin-empty">لا توجد حجوزات حتى الآن.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>المرجع</th>
                  <th>الاسم</th>
                  <th>البرنامج</th>
                  <th>الموعد</th>
                  <th>المدرس</th>
                  <th>واتساب</th>
                  <th>الحالة</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td>{b.reference}</td>
                    <td>{b.name}</td>
                    <td>{b.program}</td>
                    <td>{new Date(b.startsAt).toLocaleString("ar-EG")}</td>
                    <td>{teacherName(b.teacherId) || "—"}</td>
                    <td>
                      <a href={`https://wa.me/${b.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                        {b.whatsapp}
                      </a>
                    </td>
                    <td>
                      <span className={`pill-status pill-${b.status}`}>{statusLabels[b.status]}</span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn-mini primary" onClick={() => openReply(b)} title="رد على الحجز">
                          <Reply size={12} />
                        </button>
                        {b.teacherId && !b.creditedAt && (
                          <button className="btn-mini" onClick={() => completeLesson(b)} title="تسجيل الحصة كمكتملة (قبض + خصم رصيد)">
                            <Wallet size={12} />
                          </button>
                        )}
                        {b.creditedAt && <span className="pill-status pill-approved">تم القبض ✓</span>}
                        <button className="btn-mini danger" onClick={() => remove(b.id)} title="حذف نهائي">
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
