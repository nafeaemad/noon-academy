"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLanguage } from "./language-provider";

type ContentMap = Record<string, { ar: string; en: string }>;

const ContentContext = createContext<ContentMap>({});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<ContentMap>({});

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") setMap(data);
      })
      .catch(() => {});
  }, []);

  return <ContentContext.Provider value={map}>{children}</ContentContext.Provider>;
}

/**
 * Returns editable text for `key`, falling back to the given Arabic/English
 * defaults when no admin override has been saved yet.
 */
export function useEditableText(key: string, fallbackAr: string, fallbackEn: string) {
  const map = useContext(ContentContext);
  const { isArabic } = useLanguage();
  const override = map[key];
  if (override && (override.ar || override.en)) {
    return isArabic ? override.ar || fallbackAr : override.en || fallbackEn;
  }
  return isArabic ? fallbackAr : fallbackEn;
}

export function useEditableBilingual(key: string, fallbackAr: string, fallbackEn: string) {
  const map = useContext(ContentContext);
  const override = map[key];
  return {
    ar: override?.ar || fallbackAr,
    en: override?.en || fallbackEn,
  };
}
