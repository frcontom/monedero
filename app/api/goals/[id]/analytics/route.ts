import { runApi, json } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { getAnalytics } from "@/lib/repo/analytics";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return runApi(async () => {
    const { id } = await context.params;
    const userId = await requireUserId();
    const data = await getAnalytics(userId, id);
    return json(data);
  });
}