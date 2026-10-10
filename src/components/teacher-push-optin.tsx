"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function subscribe() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return false;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;
  const reg = (await navigator.serviceWorker.getRegistration("/")) || (await navigator.serviceWorker.register("/sw.js"));
  const ready = await navigator.serviceWorker.ready;
  const keyRes = await fetch("/api/teacher/push/key");
  const { publicKey } = await keyRes.json();
  const sub = (await reg.pushManager.getSubscription()) || (await ready.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }));
  await fetch("/api/teacher/push/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
  return true;
}

export function TeacherPushOptIn() {
  const [offered, setOffered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe feature detection; matches server's initial render of null.
      setOffered(true);
    }
  }, []);

  if (!offered || done) return null;

  return (
    <div className="chat-push-hint" style={{ borderRadius: 10, marginBottom: 20 }}>
      <Bell size={14} />
      عايز توصلك إشعارات فورية لما تتاخد حصة أو يوصل رد على طلبك؟
      <button
        className="btn-mini primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const ok = await subscribe();
            if (ok) setDone(true);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "جاري التفعيل..." : "فعّل الإشعارات"}
      </button>
    </div>
  );
}
