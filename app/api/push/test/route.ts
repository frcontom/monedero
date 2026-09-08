import { runApi, json } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { listSubscriptions } from "@/lib/repo/push";
import { sendPush, pushConfigured } from "@/lib/push";

export async function POST() {
  return runApi(async () => {
    const userId = await requireUserId();
    if (!pushConfigured()) return json({ ok: false, message: "Push no configurado" }, 400);
    const subs = await listSubscriptions(userId);
    await sendPush(
      subs.map((s) => ({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth })),
      { title: "🔔 Monedero", body: "¡Notificación de prueba! Notificaciones activadas." },
    );
    return json({ ok: true, sent: subs.length });
  });
}