"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/content";

type LanguageContextValue = { locale: Locale; setLocale: (locale: Locale) => void; isArabic: boolean };
const LanguageContext = createContext<LanguageContextValue>({ locale: "en", setLocale: () => undefined, isArabic: false });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    const saved = localStorage.getItem("noon-locale") as Locale | null;
    const detected = navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
    setLocaleState(saved === "ar" || saved === "en" ? saved : detected);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  const setLocale = (next: Locale) => { setLocaleState(next); localStorage.setItem("noon-locale", next); };
  return <LanguageContext.Provider value={{ locale, setLocale, isArabic: locale === "ar" }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
