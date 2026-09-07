"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MoneyInput } from "@/components/ui/currency-input";
import { useAddMovement } from "@/lib/client/hooks";
import { todayLocal } from "@/lib/calc/goals";

const movementFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  amountText: z
    .string()
    .regex(/^\d+$/, "Monto inválido")
    .refine((v) => Number(v) > 0, "El monto debe ser mayor a 0"),
  description: z.string().max(500, "Máximo 500 caracteres").optional().nullable(),
});

type FormValues = z.infer<typeof movementFormSchema>;

export function MovementForm({ goalId }: { goalId: string }) {
  const mutation = useAddMovement(goalId);
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: { date: todayLocal(), amountText: "", description: "" },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(
      {
        date: values.date,
        type,
        amount: Number(values.amountText),
        description: values.description || null,
      },
      {
        onSuccess: () => {
          reset({ date: todayLocal(), amountText: "", description: "" });
        },
      },
    );
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <h3 className="mb-3 font-semibold">Registrar movimiento</h3>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setType("deposit")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
            type === "deposit"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
          }`}
        >
          + Aporte
        </button>
        <button
          type="button"
          onClick={() => setType("withdrawal")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
            type === "withdrawal"
              ? "bg-red-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
          }`}
        >
          − Retiro
        </button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="movementAmount" className="mb-1 block text-sm font-medium">
            Monto ($)
          </label>
          <Controller
            control={control}
            name="amountText"
            render={({ field }) => (
              <MoneyInput
                id="movementAmount"
                className={inputClass}
                placeholder="Ej. 200.000"
                value={field.value || undefined}
                onValueChange={(value) => field.onChange(value ?? "")}
              />
            )}
          />
          {errors.amountText && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amountText.message}</p>}
        </div>
        <div>
          <label htmlFor="movementDate" className="mb-1 block text-sm font-medium">
            Fecha
          </label>
          <input id="movementDate" type="date" className={inputClass} {...register("date")} />
          {errors.date && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date.message}</p>}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="movementDescription" className="mb-1 block text-sm font-medium">
          Descripción (opcional)
        </label>
        <input id="movementDescription" className={inputClass} placeholder="Ej. Aporte quincenal" {...register("description")} />
      </div>

      {mutation.isError && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{mutation.error.message}</p>}

      <button
        type="submit"
        disabled={mutation.isPending}
        className={`w-full rounded-lg px-4 py-2.5 font-medium text-white transition disabled:opacity-60 ${
          type === "deposit" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {mutation.isPending ? "Guardando…" : type === "deposit" ? "Registrar aporte" : "Registrar retiro"}
      </button>
    </form>
  );
}