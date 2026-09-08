import { runApi, json } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { pushConfigured } from "@/lib/push";

export async function GET() {
  return runApi(async () => {
    await requireUserId();
    if (!pushConfigured()) {
      return json({ enabled: false, key: null });
    }
    return json({ enabled: true, key: process.env.VAPID_PUBLIC_KEY });
  });
}