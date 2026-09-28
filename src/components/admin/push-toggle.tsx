"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";

type State = "loading" | "unsupported" | "denied" | "off" | "on";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function getRegistration() {
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;
  await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
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
        const sub = await reg.pushManager.getSubscription();
        if (sub && Notification.permission === "granted") {
          // Make sure the server still knows about this device.
          await fetch("/api/admin/push/subscribe", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(sub.toJSON()),
          });
          setState("on");
        } else {
          setState("off");
        }
      } catch {
        setState("off");
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
      const keyRes = await fetch("/api/admin/push/key");
      const { publicKey } = await keyRes.json();
      const sub =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));
      const res = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("subscribe failed");
      setState("on");
      setMessage("تم التفعيل ✓ جرّب الزرار التجريبي للتأكد.");
    } catch {
      setMessage("تعذّر التفعيل على هذا الجهاز. تأكد من الاتصال وحاول مرة أخرى.");
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
      const data = await res.json();
      setMessage(data.sent > 0 ? "اتبعت إشعار تجريبي، المفروض يوصلك دلوقتي." : "مفيش جهاز مفعّل يستقبل الإشعارات.");
    } catch {
      setMessage("تعذّر إرسال الإشعار التجريبي.");
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
        {state === "off" && (
          <button className="button button-primary" onClick={enable} disabled={busy}>
            <Bell size={16} /> تفعيل الإشعارات
          </button>
        )}
        {state === "on" && (
          <div className="admin-actions">
            <button className="btn-mini primary" onClick={sendTest} disabled={busy}>
              <Send size={12} /> إشعار تجريبي
            </button>
            <button className="btn-mini danger" onClick={disable} disabled={busy}>
              <BellOff size={12} /> إيقاف
            </button>
          </div>
        )}
      </div>
      {state === "loading" && <p style={{ fontSize: 12, margin: 0 }}>جاري التحقق...</p>}
      {state === "on" && <p style={{ fontSize: 12, margin: 0, color: "#1e6549", fontWeight: 700 }}>الإشعارات مفعّلة على هذا الجهاز ✓</p>}
      {state === "denied" && (
        <p style={{ fontSize: 12, margin: 0, color: "#9d2920" }}>
          الإشعارات محظورة لهذا الموقع. فعّلها من إعدادات التطبيق أو المتصفح (Notifications → Allow) ثم حدّث الصفحة.
        </p>
      )}
      {state === "unsupported" && (
        <p style={{ fontSize: 12, margin: 0, color: "#9d2920" }}>هذا المتصفح لا يدعم إشعارات الموبايل. جرّب Chrome أو تطبيق أندرويد.</p>
      )}
      {message && <p style={{ fontSize: 12, margin: "8px 0 0", fontWeight: 700 }}>{message}</p>}
    </div>
  );
}
