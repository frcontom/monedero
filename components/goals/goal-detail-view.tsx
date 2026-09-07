"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import {
  useDeleteGoal,
  useGoal,
  useProjection,
  useSetStatus,
} from "@/lib/client/hooks";
import {
  CATEGORY_LABEL,
  PERFORMANCE_COLOR,
  PERFORMANCE_LABEL,
  STATUS_LABEL,
} from "@/components/goals/labels";
import { GoalModal } from "@/components/goals/goal-modal";
import { MovementForm } from "@/components/goals/movement-form";
import { MovementHistory } from "@/components/goals/movement-history";
import { ProgressCurve } from "@/components/charts/progress-curve";

export function GoalDetailView({ goalId }: { goalId: string }) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useGoal(goalId);
  const projection = useProjection(goalId);
  const setStatus = useSetStatus();
  const deleteGoal = useDeleteGoal();
  const [editOpen, setEditOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) return <p className="text-slate-500 dark:text-slate-400">Cargando…</p>;
  if (isError) return <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>;
  if (!data) return null;

  const goal = data.goal;
  const isActive = goal.status === "ACTIVE";
  const isPaused = goal.status === "PAUSED";
  const isDone = goal.status === "COMPLETED" || goal.status === "CANCELLED";

  const runStatus = (status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED") => {
    setActionError(null);
    setStatus.mutate(
      { id: goalId, status },
      {
        onError: (e) => setActionError(e.message),
      },
    );
  };

  const p = projection.data;

  const statCards = [
    { label: "Objetivo", value: formatMoney(goal.targetAmount) },
    { label: "Acumulado", value: formatMoney(goal.accumulated) },
    { label: "Restante", value: formatMoney(goal.remaining) },
    { label: "Progreso", value: `${Math.round(goal.progressPct)}%` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Link href="/metas" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Metas
      </Link>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{goal.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {CATEGORY_LABEL[goal.category]} · {STATUS_LABEL[goal.status]}
              {goal.targetDate ? ` · Objetivo: ${formatDate(goal.targetDate)}` : ""}
            </p>
            {goal.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{goal.description}</p>}
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="shrink-0 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Editar
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PERFORMANCE_COLOR[goal.performanceStatus]}`}>
            {PERFORMANCE_LABEL[goal.performanceStatus]}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className="mt-0.5 font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        {!isDone && (
          <div className="mt-4 flex flex-wrap gap-2">
            {isActive && (
              <>
                <button onClick={() => runStatus("PAUSED")} className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">
                  Pausar
                </button>
                <button onClick={() => runStatus("COMPLETED")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
                  Completar
                </button>
              </>
            )}
            {isPaused && (
              <button onClick={() => runStatus("ACTIVE")} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                Reanudar
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm("¿Eliminar esta meta por completo? No se puede deshacer.")) {
                  deleteGoal.mutate(goalId, {
                    onSuccess: () => router.push("/metas"),
                    onError: (e) => setActionError(e.message),
                  });
                }
              }}
              className="rounded-lg border border-red-200 dark:border-red-900 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
            >
              🗑 Eliminar meta
            </button>
          </div>
        )}
        {actionError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{actionError}</p>}
      </div>

      {p && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h2 className="mb-2 font-semibold">Proyección y ritmo</h2>
          {p.requiredDaily !== null ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Necesario / día</p>
                <p className="font-semibold">{formatMoney(Math.round(p.requiredDaily))}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Necesario / semana</p>
                <p className="font-semibold">{formatMoney(Math.round(p.requiredWeekly ?? 0))}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Necesario / mes</p>
                <p className="font-semibold">{formatMoney(Math.round(p.requiredMonthly ?? 0))}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Fecha proyectada</p>
                <p className="font-semibold">{p.projectedDate ? formatDate(p.projectedDate) : "—"}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {goal.planningMode === "PERIODIC" && goal.plannedAmount ? (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Plan por periodo</p>
                  <p className="font-semibold">{formatMoney(goal.plannedAmount)}</p>
                </div>
              ) : null}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Fecha proyectada</p>
                <p className="font-semibold">{p.projectedDate ? formatDate(p.projectedDate) : "—"}</p>
              </div>
            </div>
          )}
          <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
            ⓘ {p.explanation} (estimación, no una garantía)
          </p>
          {p.behind > 0 && (
            <p className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-950 p-2 text-sm text-amber-800 dark:text-amber-300">
              Estás {formatMoney(Math.round(p.behind))} detrás del ritmo esperado. Aporta{" "}
              <strong>{formatMoney(Math.round(p.recoveryAmount))}</strong> este periodo para recuperar el ritmo.
            </p>
          )}
          {p.lastMovementDaysAgo !== null && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Último movimiento: hace {p.lastMovementDaysAgo} día{p.lastMovementDaysAgo === 1 ? "" : "s"}
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <h2 className="mb-2 font-semibold">Curva de progreso</h2>
        <ProgressCurve goal={goal} movements={goal.movements} />
      </div>

      <MovementForm goalId={goalId} />

      <div>
        <h2 className="mb-2 font-semibold">Historial de movimientos</h2>
        <MovementHistory goalId={goalId} movements={goal.movements} />
      </div>

      <GoalModal open={editOpen} onClose={() => setEditOpen(false)} goal={goal} />
    </div>
  );
}