import { runApi, json, parseBody } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { listGoals, createGoal } from "@/lib/repo/goals";
import { goalSchema } from "@/lib/validators/goal";

export async function GET() {
  return runApi(async () => {
    const userId = await requireUserId();
    const goals = await listGoals(userId);
    return json({ goals });
  });
}

export async function POST(request: Request) {
  return runApi(async () => {
    const userId = await requireUserId();
    const data = await parseBody(goalSchema, request);
    const goal = await createGoal(userId, data);
    return json({ goal }, 201);
  });
}