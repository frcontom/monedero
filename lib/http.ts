import { z } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "ApiError";
  }
}

export function json<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

export function error(status: number, code: string, message?: string): Response {
  return Response.json({ error: { code, message: message ?? code } }, { status });
}

export async function parseBody<T>(schema: z.ZodType<T>, request: Request): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError(400, "INVALID_JSON", "JSON inválido");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const message = first
      ? `${first.path.join(".") || "body"}: ${first.message}`
      : "Datos inválidos";
    throw new ApiError(400, "VALIDATION_ERROR", message);
  }
  return parsed.data;
}

export async function runApi(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ApiError) return error(e.status, e.code, e.message);
    console.error(e);
    return error(500, "INTERNAL", "Error interno");
  }
}