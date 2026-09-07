import { runApi, json } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { getDashboard } from "@/lib/repo/analytics";

export async function GET() {
  return runApi(async () => {
    const userId = await requireUserId();
    const data = await getDashboard(userId);
    return json(data);
  });
}