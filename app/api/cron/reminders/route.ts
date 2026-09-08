import { differenceInCalendarDays, parseISO } from "date-fns";
import { runApi, json, error } from "@/lib/http";
import { listAllSubscriptions } from "@/lib/repo/push";
import { listGoals } from "@/lib/repo/goals";
import { sendPush, pushConfigured } from "@/lib/push";
import { todayLocal } from "@/lib/calc/goals";

export async function GET(request: Request) {
  if (process.env.CRON_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return error(401, "UNAUTHORIZED", "No autorizado");
    }
  }

  return runApi(async () => {
    if (!pushConfigured()) return json({ ok: false, message: "Push no configurado" });
    const subs = await listAllSubscriptions();
    if (subs.length === 0) return json({ ok: true, sentUsers: 0 });

    const byUser = new Map<string, (typeof subs)[number][]>();
    for (const s of subs) {
      const list = byUser.get(s.userId) ?? [];
      list.push(s);
      byUser.set(s.userId, list);
    }

    const today = todayLocal();
    let sentUsers = 0;

    for (const [userId, userSubs] of byUser) {
      const goals = await listGoals(userId);
      const active = goals.filter((g) => g.status === "ACTIVE");
      if (active.length === 0) continue;

      const atrasadas = active.filter((g) => g.performanceStatus === "ATRASADA").length;
      const needing = active.filter((g) => g.performanceStatus === "NECESITA_ATENCION").length;

      let lastMove: string | null = null;
      for (const g of active) {
        if (g.lastMovementDate && (!lastMove || g.lastMovementDate > lastMove)) {
          lastMove = g.lastMovementDate;
        }
      }
      const daysSince = lastMove
        ? differenceInCalendarDays(parseISO(today), parseISO(lastMove))
        : null;

      const parts: string[] = [];
      if (atrasadas > 0) parts.push(`${atrasadas} meta(s) atrasada(s)`);
      else if (needing > 0) parts.push(`${needing} meta(s) requieren atención`);
      if (daysSince !== null && daysSince >= 3) {
        parts.push(`sin movimientos hace ${daysSince} día(s)`);
      }
      if (parts.length === 0) parts.push("Todo en orden, sigue así 💪");

      await sendPush(
        userSubs.map((s) => ({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth })),
        { title: "📌 Recordatorio de metas", body: parts.join(" · "), url: "/dashboard" },
      );
      sentUsers += 1;
    }

    return json({ ok: true, sentUsers });
  });
}