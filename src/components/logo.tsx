"use client";

import { useLanguage } from "./language-provider";

export function Logo({ light = false }: { light?: boolean }) {
  const { isArabic } = useLanguage();
  return (
    <span className="logo-wrap" aria-label="Noon Academy">
      <img src="/logo.png" alt="Noon Academy" className={`logo-mark ${light ? "logo-light" : ""}`} width={76} height={38} />
      <span>
        {isArabic ? (
          <>
            <strong>أكاديمية نون</strong>
            <small>NOON ACADEMY</small>
          </>
        ) : (
          <>
            <strong className="logo-en">Noon Academy</strong>
            <small>أكاديمية نون</small>
          </>
        )}
      </span>
    </span>
  );
}
