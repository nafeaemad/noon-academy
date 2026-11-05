export type Discount = {
  id: number;
  type: "percent" | "fixed";
  value: string;
  labelAr: string;
  labelEn: string;
  messageAr: string;
  messageEn: string;
  startsAt: string | null;
  endsAt: string | null;
  scope?: "all" | "selected";
  targets?: Partial<DiscountTargets> | null;
};

export type DiscountTargets = { programs: number[]; plans: number[]; items: number[] };

/** Price after the discount (never below zero). */
export function discounted(price: number, d: Pick<Discount, "type" | "value"> | null | undefined): number {
  if (!d) return price;
  const v = Number(d.value) || 0;
  const out = d.type === "percent" ? price * (1 - Math.min(v, 100) / 100) : price - v;
  return Math.max(0, Math.round(out * 100) / 100);
}

/** Short badge text: "-20%" or "-$10". */
export function discountBadge(d: Pick<Discount, "type" | "value">, currency = "USD"): string {
  const v = Number(d.value) || 0;
  const n = Number.isInteger(v) ? String(v) : v.toFixed(2);
  if (d.type === "percent") return `-${n}%`;
  return currency === "USD" ? `-$${n}` : `-${n} ${currency}`;
}

/** One candidate discount (site-wide, per program or per plan) in a common shape. */
export type DiscountRule = {
  type: string | null;
  value: string | number | null;
  endsAt?: string | Date | null;
  noteAr?: string | null;
  noteEn?: string | null;
  source: "site" | "program" | "plan";
};

type ItemWithDiscount = {
  discountType?: string | null;
  discountValue?: string | number | null;
  discountEndsAt?: string | Date | null;
  discountNoteAr?: string | null;
  discountNoteEn?: string | null;
};

/** Discount typed in on a program or plan (null when none is set). */
export function itemRule(item: ItemWithDiscount | null | undefined, source: "program" | "plan"): DiscountRule | null {
  if (!item?.discountType || !(Number(item.discountValue) > 0)) return null;
  return { type: item.discountType, value: item.discountValue ?? 0, endsAt: item.discountEndsAt, noteAr: item.discountNoteAr, noteEn: item.discountNoteEn, source };
}

/** The site-wide discount as a rule. */
export function siteRule(d: (Pick<Discount, "type" | "value" | "endsAt"> & { labelAr?: string; labelEn?: string }) | null | undefined): DiscountRule | null {
  return d ? { type: d.type, value: d.value, endsAt: d.endsAt, noteAr: d.labelAr || null, noteEn: d.labelEn || d.labelAr || null, source: "site" } : null;
}

function live(r: DiscountRule | null | undefined, now: number): r is DiscountRule {
  if (!r || (r.type !== "percent" && r.type !== "fixed") || !(Number(r.value) > 0)) return false;
  return !(r.endsAt && new Date(r.endsAt).getTime() < now);
}

/** Whether a rule is currently usable (valid and not expired). */
export function isLive(r: DiscountRule | null | undefined, now = Date.now()) {
  return live(r, now);
}

/** Applies the single best (largest saving) live discount to a price. Discounts never stack. */
export function pickBest(price: number, rules: (DiscountRule | null | undefined)[], now = Date.now()) {
  let best: { rule: DiscountRule; final: number; amount: number } | null = null;
  for (const r of rules) {
    if (!live(r, now)) continue;
    const final = discounted(price, { type: r.type as "percent" | "fixed", value: String(r.value) });
    const amount = Math.round((price - final) * 100) / 100;
    if (amount > 0 && (!best || amount > best.amount)) best = { rule: r, final, amount };
  }
  return best;
}

export function formatMoney(n: number, currency: string) {
  const v = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return currency === "USD" ? `$${v}` : `${v} ${currency}`;
}

export const ruleBadge = (r: DiscountRule, currency = "USD") => discountBadge({ type: r.type as "percent" | "fixed", value: String(r.value) }, currency);

type Scoped = { scope?: string | null; targets?: Partial<DiscountTargets> | null };

/** Does this offer cover one program / plan / pricing-table item? "all" covers everything. */
export function appliesTo(d: Scoped, kind: keyof DiscountTargets, id: number): boolean {
  if (!d.scope || d.scope === "all") return true;
  return !!d.targets?.[kind]?.includes(id);
}

/** For a booking: covered when the offer is for all, or lists the booked program or the chosen plan. */
export function appliesToBooking(d: Scoped, programId: number | null | undefined, planId: number | null | undefined): boolean {
  if (!d.scope || d.scope === "all") return true;
  return (!!programId && !!d.targets?.programs?.includes(programId)) || (!!planId && !!d.targets?.plans?.includes(planId));
}

/** Site-wide offers (as rules) that cover the given item. */
export function rulesFor(list: (Discount & Scoped)[], kind: keyof DiscountTargets, id: number): DiscountRule[] {
  return list.filter((d) => appliesTo(d, kind, id)).map((d) => siteRule(d)!);
}
