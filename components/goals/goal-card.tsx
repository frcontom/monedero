"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { GoalSummary } from "@/lib/types";
import {
  CATEGORY_LABEL,
  PERFORMANCE_COLOR,
  PERFORMANCE_LABEL,
  STATUS_LABEL,
} from "@/components/goals/labels";

export function GoalCard({ goal }: { goal: GoalSummary }) {
  return (
    <Link
      href={`/metas/${goal.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{goal.name}</h3>
          <p className="text-xs text-slate-500">
            {CATEGORY_LABEL[goal.category]} · {STATUS_LABEL[goal.status]}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${PERFORMANCE_COLOR[goal.performanceStatus]}`}
        >
          {PERFORMANCE_LABEL[goal.performanceStatus]}
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${Math.min(100, goal.progressPct)}%` }}
        />
      </div>

      <div className="mt-2 flex items-end justify-between text-sm">
        <span className="font-semibold">{formatMoney(goal.accumulated)}</span>
        <span className="text-slate-500">
          de {formatMoney(goal.targetAmount)} · {Math.round(goal.progressPct)}%
        </span>
      </div>

      {goal.remaining > 0 && (
        <p className="mt-1 text-xs text-slate-500">
          Restante: <span className="font-medium">{formatMoney(goal.remaining)}</span>
        </p>
      )}
    </Link>
  );
}