/**
 * WhatsApp Business Cloud API (Meta) sender. Does nothing (returns skipped) until the env vars exist:
 *   WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID
 * Business-initiated messages must use an approved template:
 *   WHATSAPP_TEMPLATE_NAME (default "lesson_reminder"), WHATSAPP_TEMPLATE_LANG (default "ar")
 * The template body takes 3 variables: {{1}} name, {{2}} time, {{3}} link.
 */

export function normalizePhone(raw: string, defaultCountry = "20"): string | null {
  let d = raw.replace(/[^\d+]/g, "");
  if (!d) return null;
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = defaultCountry + d.slice(1);
  return d.length >= 8 && d.length <= 15 ? d : null;
}

export type WhatsAppResult = { ok: boolean; skipped?: boolean; error?: string };

export async function sendLessonReminder(
  phone: string,
  vars: { name: string; time: string; link: string },
): Promise<WhatsAppResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return { ok: false, skipped: true };
  const to = normalizePhone(phone);
  if (!to) return { ok: false, error: "invalid phone" };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: process.env.WHATSAPP_TEMPLATE_NAME || "lesson_reminder",
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "ar" },
          components: [
            {
              type: "body",
              parameters: [vars.name, vars.time, vars.link].map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
    });
    if (!res.ok) return { ok: false, error: (await res.text()).slice(0, 300) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}
