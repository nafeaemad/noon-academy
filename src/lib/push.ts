import webpush from "web-push";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pushConfig, pushSubscriptions } from "@/db/schema";

const SUBJECT = "mailto:nafea123456az@gmail.com";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

/** Returns the VAPID key pair, creating and saving it the first time it is needed. */
export async function getVapidKeys() {
  const existing = await db.select().from(pushConfig).where(eq(pushConfig.id, 1));
  if (existing[0]) return { publicKey: existing[0].publicKey, privateKey: existing[0].privateKey };

  const keys = webpush.generateVAPIDKeys();
  await db
    .insert(pushConfig)
    .values({ id: 1, publicKey: keys.publicKey, privateKey: keys.privateKey })
    .onConflictDoNothing();

  // Re-read in case another request created the row at the same moment.
  const saved = await db.select().from(pushConfig).where(eq(pushConfig.id, 1));
  return { publicKey: saved[0].publicKey, privateKey: saved[0].privateKey };
}

/**
 * Sends a notification to every device the admin has enabled notifications on.
 * Never throws: a failed notification must not break a booking or a review.
 */
export async function notifyAdmins(payload: PushPayload) {
  try {
    const subs = await db.select().from(pushSubscriptions);
    if (subs.length === 0) return { sent: 0, failed: 0 };

    const { publicKey, privateKey } = await getVapidKeys();
    webpush.setVapidDetails(SUBJECT, publicKey, privateKey);

    const message = JSON.stringify(payload);
    const results = await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, message, {
          TTL: 60 * 60 * 24,
          urgency: "high",
        }),
      ),
    );

    let sent = 0;
    let failed = 0;
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === "fulfilled") {
        sent++;
        continue;
      }
      failed++;
      const status = (r.reason as { statusCode?: number })?.statusCode;
      // 404/410 mean the device unsubscribed or the app was removed: forget it.
      if (status === 404 || status === 410) {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, subs[i].endpoint));
      }
    }
    return { sent, failed };
  } catch {
    return { sent: 0, failed: 0 };
  }
}
