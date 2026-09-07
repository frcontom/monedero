import { runApi, json } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { getMonthActivity } from "@/lib/repo/journal";

export async function GET(request: Request) {
  return runApi(async () => {
    const userId = await requireUserId();
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return json({ error: { code: "INVALID_MONTH", message: "Mes inválido (YYYY-MM)" } }, 400);
    }
    const entries = await getMonthActivity(userId, month);
    return json({ entries });
  });
}