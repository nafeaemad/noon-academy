/** Reads the discount fields of a program/plan form. No type or no positive value = no discount. */
export function itemDiscountValues(body: Record<string, unknown>) {
  const type = body.discountType === "percent" || body.discountType === "fixed" ? body.discountType : null;
  let value = Number(body.discountValue) || 0;
  if (type === "percent") value = Math.min(value, 100);
  if (!type || value <= 0) {
    return { discountType: null, discountValue: null, discountNoteAr: null, discountNoteEn: null, discountEndsAt: null };
  }
  const note = (v: unknown) => (String(v ?? "").trim().slice(0, 500) || null);
  const ends = body.discountEndsAt ? new Date(String(body.discountEndsAt)) : null;
  return {
    discountType: type as "percent" | "fixed",
    discountValue: String(value),
    discountNoteAr: note(body.discountNoteAr),
    discountNoteEn: note(body.discountNoteEn),
    discountEndsAt: ends && !Number.isNaN(ends.getTime()) ? ends : null,
  };
}
