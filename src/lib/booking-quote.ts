import { and, asc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { discounts, plans, programs } from "@/db/schema";
import { itemRule, pickBest, ruleBadge, siteRule } from "@/lib/discount";

export type BookingQuote = {
  planId: number;
  originalPrice: string;
  discountAmount: string;
  finalPrice: string;
  priceCurrency: string;
  discountLabel: string | null;
};

const sourceAr = { site: "عرض عام", program: "خصم البرنامج", plan: "خصم الباقة" } as const;

/**
 * The real price of a booking, worked out on the server (the browser's numbers are never trusted):
 * plan price minus the single best live discount among the site-wide offer, the program's and the plan's.
 */
export async function quoteBooking(programTitleEn: string, planId: number | null): Promise<BookingQuote | null> {
  if (!planId) return null;
  const [plan] = await db.select().from(plans).where(and(eq(plans.id, planId), eq(plans.active, true)));
  if (!plan) return null;
  const [program] = await db.select().from(programs).where(eq(programs.titleEn, programTitleEn)).limit(1);
  const now = new Date();
  const [site] = await db
    .select()
    .from(discounts)
    .where(and(eq(discounts.active, true), or(isNull(discounts.startsAt), lte(discounts.startsAt, now)), or(isNull(discounts.endsAt), gte(discounts.endsAt, now))))
    .orderBy(asc(discounts.sort), asc(discounts.id))
    .limit(1);

  const price = Number(plan.price);
  const best = pickBest(price, [
    siteRule(site ? { type: site.type as "percent" | "fixed", value: site.value, endsAt: site.endsAt?.toISOString() ?? null } : null),
    itemRule(program, "program"),
    itemRule(plan, "plan"),
  ]);
  const final = best ? best.final : price;
  return {
    planId: plan.id,
    originalPrice: price.toFixed(2),
    discountAmount: (best ? best.amount : 0).toFixed(2),
    finalPrice: final.toFixed(2),
    priceCurrency: plan.currency,
    discountLabel: best ? `${ruleBadge(best.rule, plan.currency)} — ${sourceAr[best.rule.source]}` : null,
  };
}
