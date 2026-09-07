import { runApi, json, parseBody } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { setGoalStatus } from "@/lib/repo/goals";
import { goalStatusUpdateSchema } from "@/lib/validators/goal";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return runApi(async () => {
    const { id } = await context.params;
    const userId = await requireUserId();
    const { status } = await parseBody(goalStatusUpdateSchema, request);
    const goal = await setGoalStatus(userId, id, status);
    return json({ goal });
  });
}