import { runApi, json } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { getHeatmap } from "@/lib/repo/journal";

export async function GET(request: Request) {
  return runApi(async () => {
    const userId = await requireUserId();
    const url = new URL(request.url);
    const weeks = Math.min(26, Math.max(4, Number(url.searchParams.get("weeks") ?? 16) || 16));
    const days = await getHeatmap(userId, weeks);
    return json({ days });
  });
}