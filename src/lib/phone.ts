export function normalizePhone(raw: string, defaultCountry = "20"): string | null {
  let d = raw.replace(/[^\d+]/g, "");
  if (!d) return null;
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = defaultCountry + d.slice(1);
  return d.length >= 8 && d.length <= 15 ? d : null;
}
