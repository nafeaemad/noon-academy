export function pricingValues(body: Record<string, unknown>) {
  const s = (v: unknown, max = 160) => String(v ?? "").slice(0, max);
  return {
    kind: body.kind === "course" ? "course" : "row",
    titleAr: s(body.titleAr),
    titleEn: s(body.titleEn),
    col2Ar: s(body.col2Ar),
    col2En: s(body.col2En),
    descAr: s(body.descAr, 2000),
    descEn: s(body.descEn, 2000),
    price: String(Number(body.price) || 0),
    currency: s(body.currency, 8) || "USD",
    unitAr: s(body.unitAr, 60),
    unitEn: s(body.unitEn, 60),
    sort: Number(body.sort) || 0,
    active: body.active !== false,
  };
}
