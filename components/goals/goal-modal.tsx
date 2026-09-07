"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { goalSchema } from "@/lib/validators/goal";
import type { GoalInput } from "@/lib/validators/goal";
import { useCreateGoal, useUpdateGoal } from "@/lib/client/hooks";
import { CATEGORY_LABEL, PERIODICITY_LABEL } from "@/components/goals/labels";
import type { GoalSummary } from "@/lib/types";
import { todayLocal } from "@/lib/calc/goals";

type Props = {
  open: boolean;
  onClose: () => void;
  goal?: GoalSummary | null;
};

const categoryOptions = Object.entries(CATEGORY_LABEL);
const periodicityOptions = Object.entries(PERIODICITY_LABEL);

function toDefaults(goal?: GoalSummary | null): GoalInput {
  if (goal) {
    return {
      name: goal.name,
      description: goal.description ?? "",
      targetAmount: goal.targetAmount,
      startDate: goal.startDate,
      dateMode: goal.dateMode,
      targetDate: goal.targetDate ?? "",
      planningMode: goal.planningMode,
      periodicity: goal.planningMode === "PERIODIC" ? goal.periodicity ?? "MONTHLY" : null,
      plannedAmount:
        goal.planningMode === "PERIODIC" ? goal.plannedAmount ?? Number.NaN : undefined,
      category: goal.category,
    };
  }
  return {
    name: "",
    description: "",
    targetAmount: Number.NaN,
    startDate: todayLocal(),
    dateMode: "TARGET_DATE",
    targetDate: "",
    planningMode: "PERIODIC",
    periodicity: "MONTHLY",
    plannedAmount: Number.NaN,
    category: "OTRO",
  };
}

export function GoalModal({ open, onClose, goal }: Props) {
  const isEdit = Boolean(goal);
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const mutation = isEdit ? updateMutation : createMutation;
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: toDefaults(goal),
  });

  const dateMode = useWatch({ control, name: "dateMode" });
  const planningMode = useWatch({ control, name: "planningMode" });

  useEffect(() => {
    if (dateMode === "NO_DATE") setValue("targetDate", "");
  }, [dateMode, setValue]);

  useEffect(() => {
    if (planningMode === "FLEXIBLE") {
      setValue("periodicity", null);
      setValue("plannedAmount", undefined);
    }
  }, [planningMode, setValue]);

  const onSubmit = (values: GoalInput) => {
    setFormError(null);
    const payload: GoalInput = {
      ...values,
      targetAmount: values.targetAmount,
      targetDate: values.dateMode === "TARGET_DATE" ? values.targetDate : null,
      periodicity: values.planningMode === "PERIODIC" ? values.periodicity : null,
      plannedAmount: values.planningMode === "PERIODIC" ? values.plannedAmount : null,
      description: values.description || null,
    };

    const success = () => onClose();
    if (isEdit && goal) {
      updateMutation.mutate({ id: goal.id, data: payload }, {
        onSuccess: success,
        onError: (e) => setFormError(e.message),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: success,
        onError: (e) => setFormError(e.message),
      });
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "mb-1 block text-sm font-medium";
  const errorClass = "mt-1 text-sm text-red-600";

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Editar meta" : "Nueva meta"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="name" className={labelClass}>
            Nombre de la meta
          </label>
          <input id="name" className={inputClass} placeholder="Ej. Comprar PC" {...register("name")} />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="targetAmount" className={labelClass}>
              Monto objetivo ($)
            </label>
            <input
              id="targetAmount"
              type="number"
              inputMode="numeric"
              min={1}
              className={inputClass}
              placeholder="Ej. 5000000"
              {...register("targetAmount", { setValueAs: (v) => (v === "" ? Number.NaN : Number(v)) })}
            />
            {errors.targetAmount && <p className={errorClass}>{errors.targetAmount.message}</p>}
          </div>
          <div>
            <label htmlFor="startDate" className={labelClass}>
              Fecha de inicio
            </label>
            <input id="startDate" type="date" className={inputClass} {...register("startDate")} />
            {errors.startDate && <p className={errorClass}>{errors.startDate.message}</p>}
          </div>
        </div>

        <div>
          <span className={labelClass}>Fecha objetivo</span>
          <div className="flex gap-2">
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                value="TARGET_DATE"
                className="accent-blue-600"
                {...register("dateMode")}
              />
              <span className="text-sm">Con fecha</span>
            </label>
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                value="NO_DATE"
                className="accent-blue-600"
                {...register("dateMode")}
              />
              <span className="text-sm">Sin fecha</span>
            </label>
          </div>
        </div>

        {dateMode === "TARGET_DATE" && (
          <div>
            <label htmlFor="targetDate" className={labelClass}>
              Fecha objetivo
            </label>
            <input id="targetDate" type="date" className={inputClass} {...register("targetDate")} />
            {errors.targetDate && <p className={errorClass}>{errors.targetDate.message}</p>}
          </div>
        )}

        <div>
          <span className={labelClass}>Plan de aportes</span>
          <div className="flex gap-2">
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                value="PERIODIC"
                className="accent-blue-600"
                {...register("planningMode")}
              />
              <span className="text-sm">Periódico</span>
            </label>
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                value="FLEXIBLE"
                className="accent-blue-600"
                {...register("planningMode")}
              />
              <span className="text-sm">Flexible</span>
            </label>
          </div>
        </div>

        {planningMode === "PERIODIC" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="periodicity" className={labelClass}>
                Periodicidad
              </label>
              <select id="periodicity" className={inputClass} {...register("periodicity")}>
                {periodicityOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.periodicity && <p className={errorClass}>{errors.periodicity.message}</p>}
            </div>
            <div>
              <label htmlFor="plannedAmount" className={labelClass}>
                Monto por periodo ($)
              </label>
              <input
                id="plannedAmount"
                type="number"
                inputMode="numeric"
                min={1}
                className={inputClass}
                placeholder="Ej. 500000"
                {...register("plannedAmount", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              />
              {errors.plannedAmount && <p className={errorClass}>{errors.plannedAmount.message}</p>}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="category" className={labelClass}>
            Categoría
          </label>
          <select id="category" className={inputClass} {...register("category")}>
            {categoryOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Descripción (opcional)
          </label>
          <textarea
            id="description"
            rows={2}
            className={inputClass}
            {...register("description")}
          />
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}
        {mutation.isError && <p className="text-sm text-red-600">{mutation.error.message}</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {mutation.isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear meta"}
        </button>
      </form>
    </Modal>
  );
}