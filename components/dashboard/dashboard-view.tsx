"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { useDashboard, useGoals } from "@/lib/client/hooks";
import { GoalModal } from "@/components/goals/goal-modal";
import {
  PERFORMANCE_COLOR,
  PERFORMANCE_LABEL,
} from "@/components/goals/labels";

export function DashboardView() {
  const { data, isLoading } = useDashboard();
  const goals = useGoals();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) return <p className="text-slate-500 dark:text-slate-400">Cargando…</p>;
  if (!data) return null;

  const nameOf = new Map(goals.data?.goals.map((g) => [g.id, g.name]) ?? []);

  const attentionGoals = (goals.data?.goals ?? []).filter(
    (g) =>
      g.status === "ACTIVE" &&
      (g.performanceStatus === "ATRASADA" || g.performanceStatus === "NECESITA_ATENCION"),
  );

  const totalsCards = [
    { label: "Metas activas", value: String(data.totals.goals) },
    { label: "Objetivo total", value: formatMoney(data.totals.targetAmount) },
    { label: "Acumulado total", value: formatMoney(data.totals.accumulated) },
    { label: "Pendiente total", value: formatMoney(data.totals.remaining) },
  ];

  const perfCards = [
    { label: "Alcanzadas", value: data.performance.achieved, color: "text-blue-700" },
    { label: "En ritmo", value: data.performance.onTrack, color: "text-emerald-700 dark:text-emerald-400" },
    { label: "Necesitan atención", value: data.performance.needsAttention, color: "text-amber-700" },
    { label: "Atrasadas", value: data.performance.behind, color: "text-red-700 dark:text-red-400" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Nueva meta
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {totalsCards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
            <p className="mt-1 font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Progreso global</h2>
          <span className="text-sm font-medium">{Math.round(data.totals.progressPct)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${Math.min(100, data.totals.progressPct)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {perfCards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
          </div>
        ))}
      </div>

      {attentionGoals.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4">
          <h2 className="mb-2 font-semibold text-amber-900 dark:text-amber-200">Requieren atención</h2>
          <div className="flex flex-col gap-2">
            {attentionGoals.map((g) => (
              <Link
                key={g.id}
                href={`/metas/${g.id}`}
                className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              >
                <span className="font-medium">{g.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${PERFORMANCE_COLOR[g.performanceStatus]}`}>
                  {PERFORMANCE_LABEL[g.performanceStatus]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <h2 className="mb-2 font-semibold">Actividad reciente</h2>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Sin movimientos recientes.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentActivity.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{nameOf.get(m.goalId) ?? "Meta"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(m.date)}</p>
                </div>
                <span className={`font-semibold ${m.type === "deposit" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                  {m.type === "deposit" ? "+" : "−"} {formatMoney(m.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <GoalModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}