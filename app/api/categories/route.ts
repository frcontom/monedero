import { runApi, json, parseBody } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { listCategories, createCategory } from "@/lib/repo/categories";
import { categorySchema } from "@/lib/validators/category";

export async function GET() {
  return runApi(async () => {
    const userId = await requireUserId();
    const categories = await listCategories(userId);
    return json({ categories });
  });
}

export async function POST(request: Request) {
  return runApi(async () => {
    const userId = await requireUserId();
    const data = await parseBody(categorySchema, request);
    const category = await createCategory(userId, data);
    return json({ category }, 201);
  });
}