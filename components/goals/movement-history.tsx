"use client";

import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { MovementRow } from "@/components/goals/movement-row";
import type { Movement } from "@/lib/types";

export function MovementHistory({ goalId, movements }: { goalId: string; movements: Movement[] }) {
  if (movements.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 px-6 py-8 text-center text-slate-500 dark:text-slate-400">
        Sin movimientos todavía.
      </p>
    );
  }

  const byDate = new Map<string, Movement[]>();
  for (const m of movements) {
    const list = byDate.get(m.date) ?? [];
    list.push(m);
    byDate.set(m.date, list);
  }

  const dates = [...byDate.keys()].sort().reverse();

  return (
    <div className="flex flex-col gap-4">
      {dates.map((d) => {
        const items = byDate.get(d)!;
        const net = items.reduce((s, m) => s + (m.type === "deposit" ? m.amount : -m.amount), 0);
        return (
          <div key={d}>
            <div className="mb-1.5 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {formatDate(d)}
              </span>
              <span
                className={`text-xs font-medium ${
                  net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {net >= 0 ? "+" : ""}
                {formatMoney(net)}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {items.map((m) => (
                <MovementRow key={m.id} goalId={goalId} movement={m} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}