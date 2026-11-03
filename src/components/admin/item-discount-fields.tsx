"use client";

import { Percent, DollarSign, Tag } from "lucide-react";

export type ItemDiscountForm = {
  discountType: "" | "percent" | "fixed";
  discountValue: string;
  discountNoteAr: string;
  discountNoteEn: string;
  discountEndsAt: string; // datetime-local text
};

export const noDiscount: ItemDiscountForm = { discountType: "", discountValue: "", discountNoteAr: "", discountNoteEn: "", discountEndsAt: "" };

type Source = {
  discountType: string | null;
  discountValue: string | null;
  discountNoteAr: string | null;
  discountNoteEn: string | null;
  discountEndsAt: string | null;
};

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

/** Form values for an existing program/plan. */
export function discountFormFrom(p: Source): ItemDiscountForm {
  return {
    discountType: p.discountType === "percent" || p.discountType === "fixed" ? p.discountType : "",
    discountValue: p.discountValue ? String(Number(p.discountValue)) : "",
    discountNoteAr: p.discountNoteAr ?? "",
    discountNoteEn: p.discountNoteEn ?? "",
    discountEndsAt: toLocalInput(p.discountEndsAt),
  };
}

/** Fields to send to the API (the end date goes out as a real ISO instant). */
export function discountPayload(f: ItemDiscountForm) {
  return { ...f, discountEndsAt: f.discountEndsAt ? new Date(f.discountEndsAt).toISOString() : "" };
}

export function ItemDiscountFields({ value, onChange }: { value: ItemDiscountForm; onChange: (patch: Partial<ItemDiscountForm>) => void }) {
  const pill = (active: boolean) => (active ? { background: "var(--green)", color: "#fff" } : undefined);
  return (
    <div className="field full" style={{ border: "1px dashed #c7a76b", borderRadius: 12, padding: 14, background: "#fffaf0" }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, color: "#8a6a2c" }}>
        <Tag size={15} /> خصم على ده (اختياري) — بيتحسب فعليًا في الحجز
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0" }}>
        <button type="button" className="btn-mini" style={pill(value.discountType === "")} onClick={() => onChange({ discountType: "" })}>من غير خصم</button>
        <button type="button" className="btn-mini" style={pill(value.discountType === "percent")} onClick={() => onChange({ discountType: "percent" })}><Percent size={14} /> نسبة %</button>
        <button type="button" className="btn-mini" style={pill(value.discountType === "fixed")} onClick={() => onChange({ discountType: "fixed" })}><DollarSign size={14} /> مبلغ نقدي</button>
      </div>
      {value.discountType !== "" && (
        <div className="form-grid">
          <div className="field">
            <label>{value.discountType === "percent" ? "النسبة (1 إلى 100)" : "المبلغ المخصوم"}</label>
            <input type="number" min="0" max={value.discountType === "percent" ? 100 : undefined} step="0.01" value={value.discountValue} onChange={(e) => onChange({ discountValue: e.target.value })} />
          </div>
          <div className="field">
            <label>ينتهي في (اختياري)</label>
            <input type="datetime-local" value={value.discountEndsAt} onChange={(e) => onChange({ discountEndsAt: e.target.value })} />
          </div>
          <div className="field"><label>نص يظهر مع الخصم (عربي)</label><textarea rows={2} value={value.discountNoteAr} onChange={(e) => onChange({ discountNoteAr: e.target.value })} placeholder="مثال: عرض الافتتاح لأول 10 طلاب" /></div>
          <div className="field"><label>Text shown with the discount (English)</label><textarea rows={2} value={value.discountNoteEn} onChange={(e) => onChange({ discountNoteEn: e.target.value })} /></div>
        </div>
      )}
    </div>
  );
}
