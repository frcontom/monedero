import { runApi, json } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { getCategoryAnalytics } from "@/lib/repo/analytics";

export async function GET() {
  return runApi(async () => {
    const userId = await requireUserId();
    const categories = await getCategoryAnalytics(userId);
    return json({ categories });
  });
}