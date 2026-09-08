import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido"),
  icon: z.string().trim().min(1, "Ícono requerido").max(8),
});

export const categoryUpdateSchema = categorySchema.partial();

export type CategoryInput = z.infer<typeof categorySchema>;