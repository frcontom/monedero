import { runApi, json, parseBody } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { getGoalDetail, updateGoal, softDeleteGoal } from "@/lib/repo/goals";
import { goalSchema } from "@/lib/validators/goal";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return runApi(async () => {
    const { id } = await context.params;
    const userId = await requireUserId();
    const { summary, movements } = await getGoalDetail(userId, id);
    return json({ goal: { ...summary, movements } });
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return runApi(async () => {
    const { id } = await context.params;
    const userId = await requireUserId();
    const data = await parseBody(goalSchema, request);
    const goal = await updateGoal(userId, id, data);
    return json({ goal });
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  return runApi(async () => {
    const { id } = await context.params;
    const userId = await requireUserId();
    const goal = await softDeleteGoal(userId, id);
    return json({ goal });
  });
}