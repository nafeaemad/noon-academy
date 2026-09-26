"use client";
import Link from "next/link";
import { Languages, GraduationCap } from "lucide-react";
import { useLanguage } from "./language-provider";
import { PageHero } from "./page-hero";
import { useTeachers } from "@/lib/use-public-data";

export function TeachersPage() {
  const { isArabic } = useLanguage();
  const { data: teachers } = useTeachers();
  return (
    <main>
      <PageHero
        contentKey="teachers-hero"
        label={{ ar: "فريق التعليم", en: "OUR TEACHERS" }}
        title={{ ar: "معلمون يجمعون العلم والرفق", en: "Teachers with knowledge and care" }}
        description={{
          ar: "مختصون في القرآن والتجويد، ومدرّبون على تبسيط التعلم لغير الناطقين بالعربية.",
          en: "Quran and Tajweed specialists trained to make learning clear for non-Arabic speakers.",
        }}
      />
      <section className="page-content">
        <div className="container">
          {teachers.length ? (
            <div className="teacher-grid">
              {teachers.map((x) => (
                <article className="teacher-card" key={x.id}>
                  <div className="teacher-image">
                    <img
                      src={x.imageUrl || "https://images.pexels.com/photos/8617779/pexels-photo-8617779.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=650&w=520"}
                      alt={isArabic ? x.nameAr : x.nameEn}
                    />
                    {x.yearsExperience ? (
                      <span>
                        {x.yearsExperience} {isArabic ? "سنوات خبرة" : "years experience"}
                      </span>
                    ) : null}
                    <span className="availability-badge">{isArabic ? x.availabilityAr : x.availabilityEn}</span>
                  </div>
                  <div className="teacher-info">
                    <h3>{isArabic ? x.nameAr : x.nameEn}</h3>
                    <p>{isArabic ? x.specialtyAr : x.specialtyEn}</p>
                    <small>
                      <GraduationCap /> {isArabic ? x.qualificationsAr : x.qualificationsEn}
                    </small>
                    <div>
                      <Languages /> {(x.languages || []).join(", ")}
                    </div>
                    <Link className="button button-outline" href="/booking" style={{ marginTop: 15, width: "100%" }}>
                      {isArabic ? "احجز حصة" : "Book a lesson"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-reviews">
              <GraduationCap />
              <h3>{isArabic ? "قريبًا: ملفات مدرسين موثقة" : "Verified teacher profiles coming soon"}</h3>
              <p>
                {isArabic
                  ? "لن نعرض اسمًا أو مؤهلًا قبل التحقق منه. يمكنك حجز تقييم الآن وسيطابقك الفريق مع المدرس الأنسب."
                  : "We do not publish a name or qualification before verification. Book an assessment and our team will match you with the right teacher."}
              </p>
              <Link href="/booking" className="button button-primary">
                {isArabic ? "احجز تقييمًا" : "Book an assessment"}
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
