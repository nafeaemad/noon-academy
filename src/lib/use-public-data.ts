"use client";

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
  duration: number;
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
  duration: number;
  price: string;
  currency: string;
};

function usePublicList<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(url)
      .then((r) => r.json())
      .then((rows) => {
        if (active) setData(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url]);

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
