"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PageHero } from "./page-hero";

export function TeacherAuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
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
        contentKey="teacher-login-hero"
        label={{ ar: "بوابة المعلمين", en: "TEACHER PORTAL" }}
        title={{ ar: "تسجيل دخول المعلم", en: "Teacher login" }}
        description={{
          ar: "استخدم البريد الإلكتروني وكلمة المرور اللي استلمتها من إدارة الأكاديمية.",
          en: "Use the email and password you received from the academy administration.",
        }}
      />
      <section className="page-content">
        <div className="container" style={{ maxWidth: 480 }}>
          <form className="form-card" onSubmit={submit}>
            <div className="field">
              <label>البريد الإلكتروني</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>كلمة المرور</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && <div className="status-message error">{error}</div>}

            <button className="button button-primary" type="submit" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
              {loading ? "جاري التنفيذ..." : "دخول"}
            </button>

            <p className="form-note" style={{ textAlign: "center", marginTop: 18 }}>
              معندكش حساب؟ تواصل مع إدارة الأكاديمية عشان تستلم بيانات الدخول بتاعتك.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
