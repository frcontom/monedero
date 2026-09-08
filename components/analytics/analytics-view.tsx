"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalytics, useCategoryAnalytics, useGoals } from "@/lib/client/hooks";
import { formatMoney } from "@/lib/money";

export function AnalyticsView() {
  const goals = useGoals();
  const categoryAnalytics = useCategoryAnalytics();
  const [goalId, setGoalId] = useState<string>("");

  const effectiveGoalId = goalId || goals.data?.goals[0]?.id || "";
  const selectedGoal = goals.data?.goals.find((g) => g.id === effectiveGoalId);

  const analytics = useAnalytics(effectiveGoalId);
  const data = analytics;

  const monthLabel = (m: string) => {
    const [y, mm] = m.split("-");
    return `${mm}/${y.slice(2)}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analítica</h1>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Meta</label>
        <select
          value={effectiveGoalId}
          onChange={(e) => setGoalId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-3 py-2"
        >
          {(goals.data?.goals ?? []).map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {goals.isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Cargando…</p>}
      {goals.data && goals.data.goals.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 p-6 text-center text-slate-500 dark:text-slate-400">
          Crea una meta para ver analítica.
        </p>
      )}

      {categoryAnalytics.data && categoryAnalytics.data.categories.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h2 className="mb-3 font-semibold">Por categoría</h2>
          <div className="flex flex-col gap-2">
            {categoryAnalytics.data.categories.map((c) => {
              const max = Math.max(...categoryAnalytics.data!.categories.map((x) => Math.abs(x.net)), 1);
              const pct = Math.min(100, (Math.abs(c.net) / max) * 100);
              return (
                <div key={c.category} className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base"
                    style={{ backgroundColor: `${c.color}22` }}
                  >
                    {c.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{c.category}</span>
                      <span className={c.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                        {c.net >= 0 ? "+" : "−"}
                        {formatMoney(Math.abs(c.net))}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedGoal && data.data && (
        <>
          <Link href={`/metas/${selectedGoal.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Ver detalle de {selectedGoal.name} →
          </Link>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Aporte promedio", value: formatMoney(data.data.averageDeposit) },
              { label: "Movimientos", value: String(data.data.frequency.total) },
              { label: "Días con actividad", value: String(data.data.frequency.daysWithActivity) },
              { label: "Aportes / Retiros", value: `${data.data.frequency.deposits} / ${data.data.frequency.withdrawals}` },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
                <p className="mt-1 font-semibold">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <h2 className="mb-3 font-semibold">Aportes por mes</h2>
            {data.data.contributions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Sin movimientos todavía.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.data.contributions.map((c) => ({
                      ...c,
                      month: monthLabel(c.month),
                    }))}
                    margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} width={44} />
                    <Tooltip formatter={(value) => formatMoney(Math.round(Number(value)))} />
                    <Legend />
                    <Bar dataKey="deposits" name="Aportes" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="withdrawals" name="Retiros" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {data.data.planVsActual.points.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <h2 className="mb-3 font-semibold">Plan vs real</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.data.planVsActual.points.map((p) => ({
                      ...p,
                      period: `#${p.period}`,
                    }))}
                    margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} width={44} />
                    <Tooltip formatter={(value) => formatMoney(Math.round(Number(value)))} />
                    <Legend />
                    <Line type="monotone" dataKey="expected" name="Esperado" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="actual" name="Real" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}