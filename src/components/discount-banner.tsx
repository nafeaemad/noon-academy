"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { useLanguage } from "./language-provider";
import { useDiscount } from "@/lib/use-public-data";
import { discountBadge, type Discount } from "@/lib/discount";

function useCountdown(endsAt: string | null) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => setLeft(Math.max(0, new Date(endsAt).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return endsAt ? left : null;
}

/** The visual offer card. Also used for the live preview in the admin panel. */
export function DiscountView({ d, isArabic, onClose, cta = true }: { d: Pick<Discount, "type" | "value" | "labelAr" | "labelEn" | "messageAr" | "messageEn" | "endsAt">; isArabic: boolean; onClose?: () => void; cta?: boolean }) {
  const left = useCountdown(d.endsAt);
  const label = (isArabic ? d.labelAr : d.labelEn) || d.labelAr || d.labelEn;
  const message = (isArabic ? d.messageAr : d.messageEn) || d.messageAr || d.messageEn;
  const parts = left === null ? null : [
    [Math.floor(left / 86_400_000), isArabic ? "يوم" : "d"],
    [Math.floor(left / 3_600_000) % 24, isArabic ? "ساعة" : "h"],
    [Math.floor(left / 60_000) % 60, isArabic ? "دقيقة" : "m"],
    [Math.floor(left / 1000) % 60, isArabic ? "ثانية" : "s"],
  ] as const;
  return (
    <div className="discount-banner" role="region" aria-label={label}>
      <i className="spark s1" /><i className="spark s2" /><i className="spark s3" /><i className="spark s4" /><i className="spark s5" />
      <div className="discount-inner">
        <div className="discount-badge">
          <small>{isArabic ? "خصم" : "SAVE"}</small>
          <strong>{discountBadge(d)}</strong>
        </div>
        <div className="discount-text">
          {label && (
            <b>
              <Sparkles size={16} /> {label}
            </b>
          )}
          {message && <p>{message}</p>}
        </div>
        {parts && left !== null && left > 0 && (
          <div className="discount-count" aria-label="countdown">
            {parts.map(([n, u]) => (
              <span key={u}>
                <strong>{String(n).padStart(2, "0")}</strong>
                <small>{u}</small>
              </span>
            ))}
          </div>
        )}
        {cta && (
          <Link href="/booking" className="discount-cta">
            {isArabic ? "احجز واستفد من الخصم" : "Book & save"}
          </Link>
        )}
      </div>
      {onClose && (
        <button className="discount-close" onClick={onClose} aria-label="close">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function DiscountBanner() {
  const { isArabic } = useLanguage();
  const { discount } = useDiscount();
  const pathname = usePathname();
  const [closed, setClosed] = useState(false);
  if (!discount || closed) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/teacher")) return null;
  return <DiscountView d={discount} isArabic={isArabic} onClose={() => setClosed(true)} />;
}
