"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLanguage } from "./language-provider";
import { PageHero } from "./page-hero";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { isArabic } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((data) => setGoogleEnabled(Boolean(data?.google)))
      .catch(() => {});
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || (isArabic ? "حدث خطأ" : "Something went wrong"));
          return;
        }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError(isArabic ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Incorrect email or password.");
        return;
      }
      router.push(params.get("callbackUrl") || "/account");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <PageHero
        contentKey={mode === "login" ? "login-hero" : "signup-hero"}
        label={{ ar: "حسابي", en: "ACCOUNT" }}
        title={mode === "login" ? { ar: "تسجيل الدخول", en: "Log in" } : { ar: "إنشاء حساب جديد", en: "Create your account" }}
        description={{
          ar: "احفظ حجوزاتك وتابع رحلتك مع أكاديمية نون من حساب واحد.",
          en: "Save your bookings and follow your journey with Noon Academy from one account.",
        }}
      />
      <section className="page-content">
        <div className="container" style={{ maxWidth: 440 }}>
          <form className="form-card" onSubmit={submit}>
            {googleEnabled && (
              <>
                <button
                  type="button"
                  className="button button-outline"
                  style={{ width: "100%", marginBottom: 16 }}
                  onClick={() => signIn("google", { callbackUrl: params.get("callbackUrl") || "/account" })}
                >
                  {isArabic ? "المتابعة بحساب جوجل" : "Continue with Google"}
                </button>
                <div className="form-note" style={{ textAlign: "center", margin: "0 0 16px" }}>
                  {isArabic ? "أو" : "or"}
                </div>
              </>
            )}

            {mode === "signup" && (
              <div className="field">
                <label>{isArabic ? "الاسم" : "Name"}</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="field">
              <label>{isArabic ? "البريد الإلكتروني" : "Email"}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>{isArabic ? "كلمة المرور" : "Password"}</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && <div className="status-message error">{error}</div>}

            <button className="button button-primary" type="submit" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
              {loading ? (isArabic ? "جاري التنفيذ..." : "Please wait...") : mode === "login" ? (isArabic ? "دخول" : "Log in") : (isArabic ? "إنشاء الحساب" : "Create account")}
            </button>

            <p className="form-note" style={{ textAlign: "center", marginTop: 18 }}>
              {mode === "login" ? (
                <>
                  {isArabic ? "معندكش حساب؟" : "Don't have an account?"} <Link href="/signup" className="text-link" style={{ display: "inline-flex" }}>{isArabic ? "أنشئ واحد" : "Sign up"}</Link>
                </>
              ) : (
                <>
                  {isArabic ? "عندك حساب بالفعل؟" : "Already have an account?"} <Link href="/login" className="text-link" style={{ display: "inline-flex" }}>{isArabic ? "سجّل الدخول" : "Log in"}</Link>
                </>
              )}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
