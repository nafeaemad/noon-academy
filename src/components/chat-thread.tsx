"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Send, Bell } from "lucide-react";
import { useLanguage } from "./language-provider";
import { PageHero } from "./page-hero";

type Message = { id: number; senderType: "user" | "admin"; body: string; createdAt: string };

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function enableUserPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return false;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;
  const reg = (await navigator.serviceWorker.getRegistration("/")) || (await navigator.serviceWorker.register("/sw.js"));
  const ready = await navigator.serviceWorker.ready;
  const keyRes = await fetch("/api/account/push/key");
  if (!keyRes.ok) return false;
  const { publicKey } = await keyRes.json();
  const sub = (await reg.pushManager.getSubscription()) || (await ready.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }));
  await fetch("/api/account/push/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
  return true;
}

export function ChatThread({ mode, userId, personLabel }: { mode: "user" | "admin"; userId?: number; personLabel?: string }) {
  const { isArabic } = useLanguage();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [pushOffered, setPushOffered] = useState(mode === "user");
  const endRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number | null>(null);
  const firstLoadRef = useRef(true);

  const listUrl = mode === "user" ? "/api/account/chat" : `/api/admin/chats/${userId}`;

  function extract(data: unknown): Message[] {
    if (Array.isArray(data)) return data as Message[];
    if (data && typeof data === "object" && Array.isArray((data as { messages?: unknown }).messages)) {
      return (data as { messages: Message[] }).messages;
    }
    return [];
  }

  async function load() {
    const res = await fetch(listUrl);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(extract(data));
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, mode]);

  useEffect(() => {
    if (messages === null) return;
    const count = messages.length;
    const isNew = prevCountRef.current === null || count > prevCountRef.current;
    prevCountRef.current = count;
    if (!isNew) return;
    // Jump instantly on first open; smooth-scroll only for messages that arrive after that.
    endRef.current?.scrollIntoView({ behavior: firstLoadRef.current ? "auto" : "smooth" });
    firstLoadRef.current = false;
  }, [messages]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setText("");
    try {
      const res = await fetch(listUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) await load();
    } finally {
      setSending(false);
    }
  }

  const body = (
    <div className="chat-wrap">
      {pushOffered && (
        <div className="chat-push-hint">
          <Bell size={14} />
          <span>{isArabic ? "فعّل إشعارات الشات عشان توصلك ردودنا فورًا." : "Enable chat notifications so replies reach you instantly."}</span>
          <button
            type="button"
            className="btn-mini primary"
            onClick={async () => {
              await enableUserPush();
              setPushOffered(false);
            }}
          >
            {isArabic ? "تفعيل" : "Enable"}
          </button>
          <button type="button" className="btn-mini" onClick={() => setPushOffered(false)}>
            ✕
          </button>
        </div>
      )}

      <div className="chat-messages">
        {messages === null ? (
          <p className="form-note">{isArabic ? "جاري التحميل..." : "Loading..."}</p>
        ) : messages.length === 0 ? (
          <p className="form-note">{isArabic ? "ابدأ المحادثة بإرسال رسالة." : "Start the conversation by sending a message."}</p>
        ) : (
          messages.map((m) => {
            const mine = mode === "user" ? m.senderType === "user" : m.senderType === "admin";
            return (
              <div key={m.id} className={`chat-bubble-row ${mine ? "mine" : ""}`}>
                <div className="chat-bubble">
                  <p>{m.body}</p>
                  <time>{new Date(m.createdAt).toLocaleTimeString(isArabic ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })}</time>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form className="chat-input-row" onSubmit={submit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isArabic ? "اكتب رسالتك..." : "Type a message..."}
          maxLength={2000}
        />
        <button className="button button-primary" type="submit" disabled={sending || !text.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );

  if (mode === "admin") {
    return (
      <main className="admin-page">
        <div className="container">
          <Link className="admin-back" href="/admin/chats">
            <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع لكل المحادثات
          </Link>
          <span className="section-label">شات مباشر</span>
          <h1>{personLabel}</h1>
          <div className="admin-panel" style={{ marginTop: 20, padding: 0 }}>
            {body}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageHero
        contentKey="chat-hero"
        label={{ ar: "الدعم المباشر", en: "LIVE SUPPORT" }}
        title={{ ar: "تواصل مباشر مع الأكاديمية", en: "Chat directly with the academy" }}
        description={{ ar: "ابعت رسالتك وهنرد عليك من هنا، وهتوصلك إشعار فوري بالرد.", en: "Send us a message and we'll reply right here — you'll get an instant notification." }}
      />
      <section className="page-content">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="admin-panel" style={{ padding: 0 }}>{body}</div>
        </div>
      </section>
    </main>
  );
}
