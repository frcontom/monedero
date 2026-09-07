import { runApi, json, parseBody } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { updateMovement, deleteMovement } from "@/lib/repo/goals";
import { movementSchema } from "@/lib/validators/goal";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; mid: string }> },
) {
  return runApi(async () => {
    const { id, mid } = await context.params;
    const userId = await requireUserId();
    const data = await parseBody(movementSchema, request);
    const movement = await updateMovement(userId, id, mid, data);
    return json({ movement });
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; mid: string }> },
) {
  return runApi(async () => {
    const { id, mid } = await context.params;
    const userId = await requireUserId();
    await deleteMovement(userId, id, mid);
    return json({ deleted: true });
  });
}