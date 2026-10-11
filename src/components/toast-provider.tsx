"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; type: ToastType; title: string; message?: string };

const EVENT_NAME = "noon-toast";
let seq = 0;

/** Fire a branded popup from anywhere in client code (replaces window.alert for in-app actions). */
export function toast(opts: { type?: ToastType; title: string; message?: string }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, { detail: { id: ++seq, type: opts.type || "info", title: opts.title, message: opts.message } }),
  );
}

const icons: Record<ToastType, typeof CheckCircle2> = { success: CheckCircle2, error: XCircle, info: Info };

/** Mounted once in the root layout so every page — control panel, teacher/student/visitor accounts — gets the same branded popup style. */
export function ToastProvider() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent<ToastItem>).detail;
      setItems((prev) => [...prev, detail]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== detail.id));
      }, 5000);
    }
    window.addEventListener(EVENT_NAME, onToast);
    return () => window.removeEventListener(EVENT_NAME, onToast);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="noon-toast-stack no-print">
      {items.map((t) => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={`noon-toast noon-toast-${t.type}`}>
            <Icon size={18} className="noon-toast-icon" />
            <div className="noon-toast-body">
              <strong>{t.title}</strong>
              {t.message && <p>{t.message}</p>}
              <span className="noon-toast-source">noonquran.academy</span>
            </div>
            <button
              className="noon-toast-close"
              aria-label="إغلاق"
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
