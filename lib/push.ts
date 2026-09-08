import "server-only";
import webpush from "web-push";

export type PushSub = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export function pushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT,
  );
}

let initialized = false;
function ensureInit(): boolean {
  if (!pushConfigured()) return false;
  if (!initialized) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
    initialized = true;
  }
  return true;
}

export async function sendPush(
  subscriptions: PushSub[],
  payload: { title: string; body: string; url?: string },
): Promise<void> {
  if (!ensureInit() || subscriptions.length === 0) return;
  const json = JSON.stringify(payload);
  await Promise.allSettled(
    subscriptions.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        json,
      ),
    ),
  );
}