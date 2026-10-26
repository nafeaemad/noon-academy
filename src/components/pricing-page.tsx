"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { useLanguage } from "./language-provider";
import { PageHero } from "./page-hero";
import { usePlans } from "@/lib/use-public-data";

function formatPrice(price: string, currency: string) {
  const n = Number(price);
  const value = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return currency === "USD" ? `$${value}` : `${value} ${currency}`;
}

const monthlyRows = [
  { ar: "حصتان / أسبوع", en: "2 Classes / Week", lessons: 8, fee: 28 },
  { ar: "3 حصص / أسبوع", en: "3 Classes / Week", lessons: 12, fee: 43 },
  { ar: "4 حصص / أسبوع", en: "4 Classes / Week", lessons: 16, fee: 56 },
  { ar: "5 حصص / أسبوع", en: "5 Classes / Week", lessons: 20, fee: 70 },
];

export function PricingPage() {
  const { isArabic } = useLanguage();
  const { data: plans } = usePlans();
  return (
    <main>
      <PageHero
        contentKey="pricing-hero"
        label={{ ar: "الأسعار", en: "PRICING" }}
        title={{ ar: "خطط واضحة، دون مفاجآت", en: "Simple plans. Meaningful progress." }}
        description={{
          ar: "ابدأ مجانًا، ثم اختر الإيقاع الذي يناسب هدفك ووقتك.",
          en: "Start with a free assessment, then choose the pace that suits your goals and schedule.",
        }}
      />
      <section className="page-content">
        <div className="container">
          <div className="price-table-wrap">
            <table className="price-table">
              <thead>
                <tr>
                  <th>{isArabic ? "الجدول / الأسبوع" : "Schedule / Week"}</th>
                  <th>{isArabic ? "عدد الحصص في الشهر" : "Classes per Month"}</th>
                  <th>{isArabic ? "الرسوم" : "Fee"}</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRows.map((r) => (
                  <tr key={r.en}>
                    <td>{isArabic ? r.ar : r.en}</td>
                    <td>{String(r.lessons).padStart(2, "0")} / {isArabic ? "شهر" : "Month"}</td>
                    <td>${r.fee} / {isArabic ? "شهر" : "Month"}</td>
                  </tr>
                ))}
                <tr>
                  <td>{isArabic ? "حصص الحفظ (بالساعة)" : "Hifz Classes (hour)"}</td>
                  <td>20 {isArabic ? "ساعة" : "h"} / {isArabic ? "شهر" : "Month"}</td>
                  <td>$125 / {isArabic ? "شهر" : "Month"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <article className="price-card featured quranic-card">
            <span className="badge">{isArabic ? "كورس جديد" : "NEW COURSE"}</span>
            <h3>Quranic Arabic</h3>
            <p style={{ margin: "6px 0 12px" }}>
              {isArabic
                ? "كورس يفهم فيه الطالب حوالي 50٪ من كلمات القرآن الكريم."
                : "A course that helps the student understand about 50% of the words of the Quran."}
            </p>
            <div className="price">
              $8
              <small style={{ fontSize: 11 }}> / {isArabic ? "حصة" : "lesson"}</small>
            </div>
            <p>{isArabic ? "مدة الحصة 30 دقيقة" : "30-minute lessons"}</p>
            <Link href="/booking" className="button button-primary" style={{ width: "100%" }}>
              <Check />
              {isArabic ? "احجز الآن" : "Book now"}
            </Link>
          </article>

          {plans.length ? (
            <div className="price-grid">
              {plans.map((x, i) => {
                const featured = plans.length > 1 && i === 1;
                return (
                  <article key={x.id} className={`price-card ${featured ? "featured" : ""}`}>
                    {featured && <span className="badge">{isArabic ? "الأكثر اختيارًا" : "MOST POPULAR"}</span>}
                    <h3>{isArabic ? x.nameAr : x.nameEn}</h3>
                    <div className="price">
                      {formatPrice(x.price, x.currency)}
                      <small style={{ fontSize: 11 }}>{i ? " / " + (isArabic ? "شهر" : "month") : ""}</small>
                    </div>
                    <p>
                      {x.lessonCount} {isArabic ? "حصة" : "lessons"} · {x.duration} {isArabic ? "دقيقة" : "min"}
                    </p>
                    <ul>
                      <li>
                        {x.lessonCount} {isArabic ? "حصة" : "lessons"} · {x.duration} {isArabic ? "دقيقة" : "minutes"}
                      </li>
                      <li>{isArabic ? "حصة مباشرة فردية" : "Live one-to-one lesson"}</li>
                      <li>{isArabic ? "خطة ومتابعة شخصية" : "Personal plan & follow-up"}</li>
                    </ul>
                    <Link href="/booking" className={`button ${featured ? "button-primary" : "button-outline"}`} style={{ width: "100%" }}>
                      <Check />
                      {isArabic ? "احجز الآن" : "Book now"}
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-reviews">
              <h3>{isArabic ? "الخطط قيد التجهيز" : "Plans coming soon"}</h3>
              <p>{isArabic ? "يمكنك حجز تقييم مجاني الآن وسنرشح لك الخطة المناسبة." : "Book a free assessment now and we will recommend the right plan."}</p>
              <Link href="/booking" className="button button-primary">
                {isArabic ? "احجز تقييمًا" : "Book an assessment"}
              </Link>
            </div>
          )}
          <p className="form-note" style={{ maxWidth: 700, margin: "30px auto", textAlign: "center" }}>
            {isArabic
              ? "قد تختلف الباقات حسب عمر الطالب ومدّة الحصة. سنؤكد السعر قبل أي دفع."
              : "Plans may vary by age and lesson duration; your exact total is always confirmed before payment."}
          </p>
        </div>
      </section>
    </main>
  );
}
