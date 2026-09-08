"use client";

import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { formatMoney } from "@/lib/money";
import { MoneyInput } from "@/components/ui/currency-input";
import type { GoalSummary } from "@/lib/types";

export function ProjectionScenario({ goal }: { goal: GoalSummary }) {
  const [monthly, setMonthly] = useState<string>(String(goal.plannedAmount ?? ""));
  const monthlyValue = Number(monthly);

  const result = useMemo(() => {
    if (!Number.isFinite(monthlyValue) || monthlyValue <= 0 || goal.remaining <= 0) return null;
    const perDay = monthlyValue / 30.4375;
    const days = Math.ceil(goal.remaining / perDay);
    const date = addDays(new Date(), days);
    const dateStr = format(date, "yyyy-MM-dd");
    const beatsTarget =
      goal.targetDate && dateStr <= goal.targetDate;
    return { date: format(date, "dd/MM/yyyy"), beatsTarget: beatsTarget ?? null };
  }, [monthlyValue, goal.remaining, goal.targetDate]);

  return (
    <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
      <p className="mb-2 text-sm font-medium">Simula tu ritmo</p>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[180px] flex-1">
          <label htmlFor="scenarioMonthly" className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
            Aporte mensual ($)
          </label>
          <MoneyInput
            id="scenarioMonthly"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej. 300.000"
            value={monthly || undefined}
            onValueChange={(v) => setMonthly(v ?? "")}
          />
        </div>
      </div>
      {result ? (
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          Aportando <strong>{formatMoney(monthlyValue)}</strong>/mes lograrías tu objetivo el{" "}
          <strong>{result.date}</strong>.
          {goal.targetDate && (
            <>
              {result.beatsTarget ? (
                <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                  (antes de la fecha objetivo ✓)
                </span>
              ) : (
                <span className="ml-1 text-amber-600 dark:text-amber-400">
                  (después de la fecha objetivo ✗)
                </span>
              )}
            </>
          )}
        </p>
      ) : (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {goal.remaining > 0
            ? "Ingresa un monto mensual para estimar la fecha."
            : "Meta ya alcanzada."}
        </p>
      )}
    </div>
  );
}