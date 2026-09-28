"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Send, RefreshCw } from "lucide-react";

type State = "loading" | "unsupported" | "denied" | "off" | "on" | "error";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function sameKey(a: ArrayBuffer | null | undefined, b: Uint8Array) {
  if (!a) return false;
  const x = new Uint8Array(a);
  if (x.length !== b.length) return false;
  for (let i = 0; i < x.length; i++) if (x[i] !== b[i]) return false;
  return true;
}

async function getRegistration() {
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;
  await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
}

async function fetchPublicKey() {
  const res = await fetch("/api/admin/push/key");
  if (!res.ok) throw new Error(`تعذّر جلب مفتاح الإشعارات (HTTP ${res.status})`);
  const { publicKey } = await res.json();
  return urlBase64ToUint8Array(publicKey);
}

/** Reuses the device subscription when it matches the server key, otherwise creates a fresh one. */
async function ensureSubscription(reg: ServiceWorkerRegistration, key: ReturnType<typeof urlBase64ToUint8Array>) {
  let sub = await reg.pushManager.getSubscription();
  if (sub && !sameKey(sub.options?.applicationServerKey, key)) {
    await sub.unsubscribe();
    sub = null;
  }
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  }
  return sub;
}

async function saveToServer(sub: PushSubscription) {
  const res = await fetch("/api/admin/push/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).error || "";
    } catch {
      /* ignore */
    }
    throw new Error(detail || `HTTP ${res.status}`);
  }
}

function errorText(e: unknown) {
  return e instanceof Error ? e.message : "خطأ غير معروف";
}

export function PushToggle() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      try {
        const reg = await getRegistration();
        const existing = await reg.pushManager.getSubscription();
        if (!existing || Notification.permission !== "granted") {
          setState("off");
          return;
        }
        // The browser thinks it is subscribed: make sure the server really has it.
        const key = await fetchPublicKey();
        const sub = await ensureSubscription(reg, key);
        await saveToServer(sub);
        setState("on");
      } catch (e) {
        setState("error");
        setMessage(`الجهاز مفعّل في المتصفح لكن السيرفر مقدرش يسجّله: ${errorText(e)}`);
      }
    })();
  }, []);

  async function enable() {
    setBusy(true);
    setMessage("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await getRegistration();
      const key = await fetchPublicKey();
      const sub = await ensureSubscription(reg, key);
      await saveToServer(sub);
      setState("on");
      setMessage("تم التفعيل ✓ جرّب الزرار التجريبي للتأكد.");
    } catch (e) {
      setState("error");
      setMessage(`تعذّر التفعيل: ${errorText(e)}`);
    } finally {
      setBusy(false);
    }
  }

  /** Throws the old subscription away and registers the device again from scratch. */
  async function reset() {
    setBusy(true);
    setMessage("");
    try {
      const reg = await getRegistration();
      const old = await reg.pushManager.getSubscription();
      if (old) {
        await fetch("/api/admin/push/unsubscribe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: old.endpoint }),
        });
        await old.unsubscribe();
      }
      const key = await fetchPublicKey();
      const sub = await ensureSubscription(reg, key);
      await saveToServer(sub);
      setState("on");
      setMessage("تم تسجيل الجهاز من جديد ✓ جرّب الزرار التجريبي.");
    } catch (e) {
      setState("error");
      setMessage(`تعذّرت إعادة التسجيل: ${errorText(e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage("");
    try {
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/admin/push/unsubscribe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/push/test", { method: "POST" });
      if (!res.ok) {
        setMessage(res.status === 401 ? "انتهت الجلسة، سجّل الدخول من جديد." : `فشل الطلب (HTTP ${res.status}).`);
        return;
      }
      const data: {
        total: number;
        sent: number;
        failed: number;
        errors: { status?: number; message: string }[];
        error?: string;
      } = await res.json();

      if (data.error) {
        setMessage(`خطأ في السيرفر: ${data.error}`);
      } else if (data.total === 0) {
        setMessage("السيرفر ماعندوش أي جهاز مسجّل. دوس «إعادة تسجيل الجهاز» وجرّب تاني.");
      } else if (data.sent === 0) {
        const why = data.errors.map((e) => `${e.status ?? ""} ${e.message}`.trim()).join(" | ");
        setMessage(`الإرسال فشل لكل الأجهزة: ${why}. جرّب «إعادة تسجيل الجهاز».`);
      } else {
        setMessage(`اتبعت لـ ${data.sent} جهاز${data.failed ? ` (وفشل ${data.failed})` : ""}. المفروض يوصلك دلوقتي.`);
      }
    } catch {
      setMessage("تعذّر إرسال الإشعار التجريبي (مشكلة اتصال).");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-panel" style={{ marginTop: 26 }}>
      <div className="admin-toolbar" style={{ marginBottom: 6 }}>
        <div>
          <strong style={{ fontSize: 15 }}>إشعارات الموبايل</strong>
          <p style={{ margin: "6px 0 0", fontSize: 12 }}>
            يجيلك إشعار فوري لما يوصل حجز جديد أو تقييم أو رسالة تواصل، حتى لو الموقع أو التطبيق مقفول.
          </p>
        </div>
        {(state === "off" || state === "error") && (
          <button className="button button-primary" onClick={state === "off" ? enable : reset} disabled={busy}>
            <Bell size={16} /> {state === "off" ? "تفعيل الإشعارات" : "إعادة المحاولة"}
          </button>
        )}
        {state === "on" && (
          <div className="admin-actions">
            <button className="btn-mini primary" onClick={sendTest} disabled={busy}>
              <Send size={12} /> إشعار تجريبي
            </button>
            <button className="btn-mini" onClick={reset} disabled={busy}>
              <RefreshCw size={12} /> إعادة تسجيل الجهاز
            </button>
            <button className="btn-mini danger" onClick={disable} disabled={busy}>
              <BellOff size={12} /> إيقاف
            </button>
          </div>
        )}
      </div>
      {state === "loading" && <p style={{ fontSize: 12, margin: 0 }}>جاري التحقق...</p>}
      {state === "on" && (
        <p style={{ fontSize: 12, margin: 0, color: "#1e6549", fontWeight: 700 }}>الإشعارات مفعّلة ومسجّلة على السيرفر لهذا الجهاز ✓</p>
      )}
      {state === "denied" && (
        <p style={{ fontSize: 12, margin: 0, color: "#9d2920" }}>
          الإشعارات محظورة لهذا الموقع. فعّلها من إعدادات التطبيق أو المتصفح (Notifications → Allow) ثم حدّث الصفحة.
        </p>
      )}
      {state === "unsupported" && (
        <p style={{ fontSize: 12, margin: 0, color: "#9d2920" }}>هذا المتصفح لا يدعم إشعارات الموبايل. جرّب Chrome أو تطبيق أندرويد.</p>
      )}
      {message && (
        <p style={{ fontSize: 12, margin: "8px 0 0", fontWeight: 700, color: state === "error" ? "#9d2920" : undefined, wordBreak: "break-word" }}>
          {message}
        </p>
      )}
    </div>
  );
}
