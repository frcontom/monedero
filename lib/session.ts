import "server-only";
import { auth } from "@/auth";
import { ApiError } from "./http";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new ApiError(401, "UNAUTHORIZED", "No autenticado");
  return id;
}