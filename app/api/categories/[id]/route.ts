import { runApi, json, parseBody } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { updateCategory, deleteCategory } from "@/lib/repo/categories";
import { categoryUpdateSchema } from "@/lib/validators/category";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return runApi(async () => {
    const { id } = await context.params;
    const userId = await requireUserId();
    const data = await parseBody(categoryUpdateSchema, request);
    const category = await updateCategory(userId, id, data);
    return json({ category });
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  return runApi(async () => {
    const { id } = await context.params;
    const userId = await requireUserId();
    await deleteCategory(userId, id);
    return json({ deleted: true });
  });
}