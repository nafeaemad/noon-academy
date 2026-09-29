import webpush from "web-push";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pushConfig, pushSubscriptions, userPushSubscriptions } from "@/db/schema";

const SUBJECT = "mailto:nafea123456az@gmail.com";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export type PushResult = {
  total: number;
  sent: number;
  failed: number;
  errors: { status?: number; message: string }[];
  error?: string;
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

type SubRow = { endpoint: string; p256dh: string; auth: string };

/** Shared send loop: never throws, reports exactly what happened, forgets dead endpoints. */
async function sendToSubscriptions(subs: SubRow[], payload: PushPayload, onDead: (endpoint: string) => Promise<void>): Promise<PushResult> {
  const result: PushResult = { total: subs.length, sent: 0, failed: 0, errors: [] };
  if (subs.length === 0) return result;

  try {
    const { publicKey, privateKey } = await getVapidKeys();
    webpush.setVapidDetails(SUBJECT, publicKey, privateKey);

    const message = JSON.stringify(payload);
    const settled = await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, message, {
          TTL: 60 * 60 * 24,
          urgency: "high",
          timeout: 10000,
        }),
      ),
    );

    for (let i = 0; i < settled.length; i++) {
      const r = settled[i];
      if (r.status === "fulfilled") {
        result.sent++;
        continue;
      }
      result.failed++;
      const reason = r.reason as { statusCode?: number; body?: string; message?: string };
      result.errors.push({
        status: reason?.statusCode,
        message: String(reason?.body || reason?.message || "unknown error").slice(0, 200),
      });
      // 404/410 mean the device unsubscribed or the app was removed: forget it.
      if (reason?.statusCode === 404 || reason?.statusCode === 410) {
        await onDead(subs[i].endpoint);
      }
    }
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
  }
  return result;
}

/**
 * Sends a notification to every device the admin has enabled notifications on.
 * Never throws: a failed notification must not break a booking or a review.
 */
export async function notifyAdmins(payload: PushPayload): Promise<PushResult> {
  const subs = await db.select().from(pushSubscriptions);
  return sendToSubscriptions(subs, payload, (endpoint) =>
    db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint)).then(() => undefined),
  );
}

/**
 * Sends a notification to every device a specific user (learner/parent) has
 * enabled chat notifications on. Used when the admin replies in the live chat.
 */
export async function notifyUser(userId: number, payload: PushPayload): Promise<PushResult> {
  const subs = await db.select().from(userPushSubscriptions).where(eq(userPushSubscriptions.userId, userId));
  return sendToSubscriptions(subs, payload, (endpoint) =>
    db.delete(userPushSubscriptions).where(eq(userPushSubscriptions.endpoint, endpoint)).then(() => undefined),
  );
}
