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
import { useAnalytics, useGoals } from "@/lib/client/hooks";
import { formatMoney } from "@/lib/money";

export function AnalyticsView() {
  const goals = useGoals();
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