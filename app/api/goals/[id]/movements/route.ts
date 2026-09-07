import { runApi, json, parseBody } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { listMovements, addMovement } from "@/lib/repo/goals";
import { movementSchema } from "@/lib/validators/goal";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runApi(async () => {
    const { id } = await context.params;
    const userId = await requireUserId();
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 100);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const result = await listMovements(userId, id, limit, offset);
    return json(result);
  });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return runApi(async () => {
    const { id } = await context.params;
    const userId = await requireUserId();
    const data = await parseBody(movementSchema, request);
    const movement = await addMovement(userId, id, data);
    return json({ movement }, 201);
  });
}