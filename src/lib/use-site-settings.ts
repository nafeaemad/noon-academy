"use client";

import { useEffect, useState } from "react";

export type SiteSettings = {
  whatsapp: string;
  email: string;
  responseTimeAr: string;
  responseTimeEn: string;
  facebook?: string | null;
  instagram?: string | null;
  teachersVisible: boolean;
};

const defaults: SiteSettings = {
  whatsapp: "+1 555 123 4567",
  email: "hello@noonquran.academy",
  responseTimeAr: "عادة خلال 24 ساعة",
  responseTimeEn: "Usually within 24 hours",
  facebook: null,
  instagram: null,
  teachersVisible: true,
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaults);

  useEffect(() => {
    let active = true;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (active && data) setSettings({ ...defaults, ...data });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return settings;
}

export function whatsappDigits(value: string) {
  return value.replace(/[^\d]/g, "");
}
