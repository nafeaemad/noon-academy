"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { useLanguage } from "./language-provider";
import { PageHero } from "./page-hero";
import { usePlans, usePricingItems } from "@/lib/use-public-data";

function formatPrice(price: string, currency: string) {
  const n = Number(price);
  const value = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return currency === "USD" ? `$${value}` : `${value} ${currency}`;
}

export function PricingPage() {
  const { isArabic } = useLanguage();
  const { data: plans } = usePlans();
  const { data: items } = usePricingItems();
  const rows = items.filter((i) => i.kind === "row");
  const courses = items.filter((i) => i.kind === "course");
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
          {rows.length > 0 && (
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
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{isArabic ? r.titleAr : r.titleEn}</td>
                      <td>{isArabic ? r.col2Ar : r.col2En}</td>
                      <td>
                        {formatPrice(r.price, r.currency)} {isArabic ? r.unitAr : r.unitEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {courses.map((c) => (
            <article key={c.id} className="price-card featured quranic-card">
              <h3>{isArabic ? c.titleAr : c.titleEn}</h3>
              {(isArabic ? c.descAr : c.descEn) && <p style={{ margin: "6px 0 12px" }}>{isArabic ? c.descAr : c.descEn}</p>}
              <div className="price">
                {formatPrice(c.price, c.currency)}
                <small style={{ fontSize: 11 }}> {isArabic ? c.unitAr : c.unitEn}</small>
              </div>
              <p>{isArabic ? c.col2Ar : c.col2En}</p>
              <Link href="/booking" className="button button-primary" style={{ width: "100%" }}>
                <Check />
                {isArabic ? "احجز الآن" : "Book now"}
              </Link>
            </article>
          ))}

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
