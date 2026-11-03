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
};

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
