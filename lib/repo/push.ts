import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/drizzle/schema";

export type StoredSubscription = {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function subscribe(
  userId: string,
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
): Promise<void> {
  await db
    .insert(pushSubscriptions)
    .values({
      userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { p256dh: sub.keys.p256dh, auth: sub.keys.auth, userId },
    });
}

export async function unsubscribe(userId: string, endpoint: string): Promise<void> {
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.userId, userId)));
}

export async function listSubscriptions(userId: string): Promise<StoredSubscription[]> {
  return db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
}

export async function listAllSubscriptions(): Promise<StoredSubscription[]> {
  return db.select().from(pushSubscriptions);
}