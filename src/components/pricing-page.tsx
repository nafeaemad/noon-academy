"use client";
import Link from "next/link";
import { useLanguage } from "./language-provider";
import { PageHero } from "./page-hero";
import { usePlans, usePricingItems, useDiscounts, usePrograms } from "@/lib/use-public-data";
import { itemRule, pickWithPriority, ruleBadge, isLive, rulesFor, type DiscountRule } from "@/lib/discount";

function formatPrice(price: string, currency: string) {
  const n = Number(price);
  const value = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return currency === "USD" ? `$${value}` : `${value} ${currency}`;
}

export function PricingPage() {
  const { data: allDiscounts } = useDiscounts();
  // "$56", or when a discount applies: "<old> <new> <unit> [-20%]". The item's own discount beats site offers.
  const priceView = (price: string, currency: string, own: DiscountRule | null, scoped: DiscountRule[], unit = "") => {
    const best = pickWithPriority(Number(price), [own], scoped);
    if (!best) return <>{formatPrice(price, currency)}{unit && <span className="price-unit"> {unit}</span>}</>;
    return (
      <>
        <span className="price-old">{formatPrice(price, currency)}</span>
        <span className="price-new">{formatPrice(String(best.final), currency)}</span>
        {unit && <span className="price-unit">{unit}</span>}
        <span className="price-off">{ruleBadge(best.rule, currency)}</span>
      </>
    );
  };
  const { isArabic } = useLanguage();
  const { data: plans } = usePlans();
  const { data: items } = usePricingItems();
  const { data: programs } = usePrograms();
  // A row linked to a program uses that program's own discount first, then offers that cover the program.
  const itemOffer = (r: { id: number; programId: number | null }) => {
    const prog = r.programId ? programs.find((p) => p.id === r.programId) : undefined;
    return {
      own: prog ? itemRule(prog, "program") : null,
      scoped: [...rulesFor(allDiscounts, "items", r.id), ...(r.programId ? rulesFor(allDiscounts, "programs", r.programId) : [])],
    };
  };
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
          {rows.length + plans.length + courses.length > 0 && (
            <p className="price-table-note">{isArabic ? "مدة الحلقة 30 دقيقة" : "Each lesson is 30 minutes"}</p>
          )}
          {rows.length + plans.length + courses.length > 0 && (
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
                    <tr key={`row-${r.id}`}>
                      <td>{isArabic ? r.titleAr : r.titleEn}</td>
                      <td>{isArabic ? r.col2Ar : r.col2En}</td>
                      <td>{(() => { const o = itemOffer(r); return priceView(r.price, r.currency, o.own, o.scoped, isArabic ? r.unitAr : r.unitEn); })()}</td>
                    </tr>
                  ))}
                  {courses.map((c) => (
                    <tr key={`course-${c.id}`}>
                      <td>
                        <strong>{isArabic ? c.titleAr : c.titleEn}</strong>
                        {(isArabic ? c.descAr : c.descEn) && <div className="price-row-desc">{isArabic ? c.descAr : c.descEn}</div>}
                      </td>
                      <td>{isArabic ? c.col2Ar : c.col2En}</td>
                      <td>{(() => {
                          const o = itemOffer(c);
                          const prog = c.programId ? programs.find((p) => p.id === c.programId) : undefined;
                          const note = prog ? (isArabic ? prog.discountNoteAr : prog.discountNoteEn) : null;
                          return (
                            <>
                              {priceView(c.price, c.currency, o.own, o.scoped, isArabic ? c.unitAr : c.unitEn)}
                              {isLive(o.own) && note ? <div><span className="price-note">🎁 {note}</span></div> : null}
                            </>
                          );
                        })()}</td>
                    </tr>
                  ))}
                  {plans.map((x) => {
                    const own = itemRule(x, "plan");
                    const note = isArabic ? x.discountNoteAr : x.discountNoteEn;
                    return (
                      <tr key={`plan-${x.id}`}>
                        <td>{isArabic ? x.nameAr : x.nameEn}</td>
                        <td>
                          {x.lessonCount} {isArabic ? "حصة" : "lessons"}
                          {x.duration ? ` · ${x.duration} ${isArabic ? "دقيقة" : "min"}` : ""}
                        </td>
                        <td>
                          {priceView(x.price, x.currency, own, rulesFor(allDiscounts, "plans", x.id))}
                          {isLive(own) && note ? <div><span className="price-note">🎁 {note}</span></div> : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {rows.length + plans.length + courses.length === 0 && (
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
