"use client";

import type { Discount } from "@/lib/discount";
import { useEffect, useState } from "react";

export type DbProgram = {
  id: number;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  levelAr: string;
  levelEn: string;
  ageAr: string;
  ageEn: string;
  duration: number | null;
  discountType: string | null;
  discountValue: string | null;
  discountNoteAr: string | null;
  discountNoteEn: string | null;
  discountEndsAt: string | null;
};

export type DbTeacher = {
  id: number;
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  qualificationsAr: string;
  qualificationsEn: string;
  languages: string[];
  yearsExperience: number | null;
  imageUrl: string | null;
  availabilityAr: string;
  availabilityEn: string;
};

export type DbPlan = {
  id: number;
  nameAr: string;
  nameEn: string;
  lessonCount: number;
  duration: number | null;
  discountType: string | null;
  discountValue: string | null;
  discountNoteAr: string | null;
  discountNoteEn: string | null;
  discountEndsAt: string | null;
  price: string;
  currency: string;
};

function usePublicList<T>(url: string, refreshMs?: number) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch(url, { cache: "no-store" })
        .then((r) => r.json())
        .then((rows) => {
          if (active) setData(Array.isArray(rows) ? rows : []);
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false);
        });
    load();
    // Optional: keep the list fresh so new or changed items show up without a manual reload.
    const timer = refreshMs ? setInterval(load, refreshMs) : null;
    const onVisible = () => {
      if (refreshMs && document.visibilityState === "visible") load();
    };
    if (refreshMs) document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      if (timer) clearInterval(timer);
      if (refreshMs) document.removeEventListener("visibilitychange", onVisible);
    };
  }, [url, refreshMs]);

  return { data, loading };
}

export function usePrograms() {
  return usePublicList<DbProgram>("/api/programs");
}

export function useTeachers() {
  return usePublicList<DbTeacher>("/api/teachers");
}

export function usePlans() {
  return usePublicList<DbPlan>("/api/plans");
}

export type DbPricingItem = {
  id: number;
  kind: "row" | "course";
  titleAr: string;
  titleEn: string;
  col2Ar: string;
  col2En: string;
  descAr: string;
  descEn: string;
  price: string;
  currency: string;
  unitAr: string;
  unitEn: string;
  programId: number | null;
};

export function usePricingItems() {
  return usePublicList<DbPricingItem>("/api/pricing");
}

/** Every discount currently live on the site, in display order. */
export function useDiscounts() {
  return usePublicList<Discount>("/api/discounts", 30_000);
}
