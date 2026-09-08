import { z } from "zod";
import { runApi, json, parseBody } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { subscribe, unsubscribe } from "@/lib/repo/push";
import { pushConfigured } from "@/lib/push";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const endpointSchema = z.object({ endpoint: z.string().url() });

export async function POST(request: Request) {
  return runApi(async () => {
    const userId = await requireUserId();
    if (!pushConfigured()) return json({ ok: false }, 400);
    const data = await parseBody(subscriptionSchema, request);
    await subscribe(userId, data);
    return json({ ok: true });
  });
}

export async function DELETE(request: Request) {
  return runApi(async () => {
    const userId = await requireUserId();
    const data = await parseBody(endpointSchema, request);
    await unsubscribe(userId, data.endpoint);
    return json({ ok: true });
  });
}