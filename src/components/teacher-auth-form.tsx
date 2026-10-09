"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHero } from "./page-hero";

export function TeacherAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [specialtyAr, setSpecialtyAr] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/teacher/signup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            nameAr,
            nameEn: nameEn || nameAr,
            specialtyAr,
            specialtyEn: specialtyAr,
            email,
            password,
            meetingLink,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "حدث خطأ");
          return;
        }
        setSuccess(data.message || "تم إنشاء حسابك، هيتفعّل بعد موافقة الإدارة.");
        return;
      }

      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        return;
      }
      router.push("/teacher");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <PageHero
        contentKey={mode === "login" ? "teacher-login-hero" : "teacher-signup-hero"}
        label={{ ar: "بوابة المعلمين", en: "TEACHER PORTAL" }}
        title={
          mode === "login"
            ? { ar: "تسجيل دخول المعلم", en: "Teacher login" }
            : { ar: "انضم كمعلم في أكاديمية نون", en: "Join Noon Academy as a teacher" }
        }
        description={{
          ar: "تابع حصصك وحضورك وقبضك من حسابك الخاص.",
          en: "Track your lessons, attendance and earnings from your own account.",
        }}
      />
      <section className="page-content">
        <div className="container" style={{ maxWidth: 480 }}>
          <form className="form-card" onSubmit={submit}>
            {mode === "signup" && (
              <div className="form-grid">
                <div className="field">
                  <label>الاسم (عربي)</label>
                  <input required value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
                </div>
                <div className="field">
                  <label>Name (English)</label>
                  <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
                </div>
                <div className="field full">
                  <label>التخصص</label>
                  <input required value={specialtyAr} onChange={(e) => setSpecialtyAr(e.target.value)} placeholder="تحفيظ، تجويد، قراءات..." />
                </div>
                <div className="field full">
                  <label>لينك الزوم أو جوجل ميت الثابت بتاعك</label>
                  <input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/... أو https://zoom.us/j/..." />
                </div>
              </div>
            )}
            <div className="field">
              <label>البريد الإلكتروني</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>كلمة المرور</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && <div className="status-message error">{error}</div>}
            {success && <div className="status-message success">{success}</div>}

            {!success && (
              <button className="button button-primary" type="submit" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
                {loading ? "جاري التنفيذ..." : mode === "login" ? "دخول" : "إنشاء الحساب"}
              </button>
            )}

            <p className="form-note" style={{ textAlign: "center", marginTop: 18 }}>
              {mode === "login" ? (
                <>
                  لسه معندكش حساب معلم؟{" "}
                  <Link href="/teacher-signup" className="text-link" style={{ display: "inline-flex" }}>
                    سجّل كمعلم
                  </Link>
                </>
              ) : (
                <>
                  عندك حساب بالفعل؟{" "}
                  <Link href="/teacher-login" className="text-link" style={{ display: "inline-flex" }}>
                    سجّل الدخول
                  </Link>
                </>
              )}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
