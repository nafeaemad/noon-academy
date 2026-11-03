export function discountValues(body: Record<string, unknown>) {
  const s = (v: unknown, max: number) => String(v ?? "").slice(0, max);
  const date = (v: unknown) => {
    if (!v) return null;
    const d = new Date(String(v));
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const type = body.type === "fixed" ? "fixed" : "percent";
  let value = Math.max(0, Number(body.value) || 0);
  if (type === "percent") value = Math.min(value, 100);
  return {
    type,
    value: String(value),
    labelAr: s(body.labelAr, 160),
    labelEn: s(body.labelEn, 160),
    messageAr: s(body.messageAr, 1000),
    messageEn: s(body.messageEn, 1000),
    startsAt: date(body.startsAt),
    endsAt: date(body.endsAt),
    sort: Number(body.sort) || 0,
    active: body.active !== false,
  };
}
