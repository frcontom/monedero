import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)");
const optionalDate = z.union([dateString, z.literal("")]);

export const dateModeSchema = z.enum(["TARGET_DATE", "NO_DATE"]);
export const planningModeSchema = z.enum(["PERIODIC", "FLEXIBLE"]);
export const periodicitySchema = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);
export const goalStatusSchema = z.enum(["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]);
export const categorySchema = z.enum(["AHORRO", "COMPRA", "DEUDA", "VIAJE", "FONDO", "OTRO"]);
export const movementTypeSchema = z.enum(["deposit", "withdrawal"]);

const goalFields = {
  name: z.string().trim().min(1, "Nombre requerido").max(120),
  description: z.string().trim().max(500, "Máximo 500 caracteres").optional().nullable(),
  targetAmount: z
    .number({ message: "Monto inválido" })
    .int("Monto inválido")
    .positive("Monto inválido"),
  startDate: dateString,
  dateMode: dateModeSchema,
  targetDate: optionalDate.optional().nullable(),
  planningMode: planningModeSchema,
  periodicity: periodicitySchema.optional().nullable(),
  plannedAmount: z
    .number({ message: "Monto inválido" })
    .int("Monto inválido")
    .positive("Monto inválido")
    .optional()
    .nullable(),
  category: categorySchema,
};

export const goalSchema = z
  .object(goalFields)
  .superRefine((data, ctx) => {
    if (data.dateMode === "TARGET_DATE" && !data.targetDate) {
      ctx.addIssue({ code: "custom", path: ["targetDate"], message: "La fecha objetivo es obligatoria en esta modalidad" });
    }
    if (data.dateMode === "NO_DATE" && data.targetDate) {
      ctx.addIssue({ code: "custom", path: ["targetDate"], message: "No aplica fecha objetivo en modalidad sin fecha" });
    }
    if (data.planningMode === "PERIODIC") {
      if (!data.periodicity) {
        ctx.addIssue({ code: "custom", path: ["periodicity"], message: "La periodicidad es obligatoria en plan periódico" });
      }
      if (!data.plannedAmount) {
        ctx.addIssue({ code: "custom", path: ["plannedAmount"], message: "El monto planificado es obligatorio en plan periódico" });
      }
    }
    if (data.planningMode === "FLEXIBLE") {
      if (data.periodicity || data.plannedAmount) {
        ctx.addIssue({ code: "custom", path: ["planningMode"], message: "En modalidad flexible no aplican campos periódicos" });
      }
    }
    if (data.targetDate && data.startDate && data.targetDate < data.startDate) {
      ctx.addIssue({ code: "custom", path: ["targetDate"], message: "La fecha objetivo debe ser posterior o igual a la fecha de inicio" });
    }
  });

export const movementSchema = z.object({
  date: dateString,
  type: movementTypeSchema,
  amount: z.number().int("Monto inválido").positive("El monto debe ser mayor a 0"),
  description: z.string().trim().max(500, "Máximo 500 caracteres").optional().nullable(),
});

export const goalStatusUpdateSchema = z.object({
  status: goalStatusSchema,
});

export type GoalInput = z.infer<typeof goalSchema>;
export type MovementInput = z.infer<typeof movementSchema>;