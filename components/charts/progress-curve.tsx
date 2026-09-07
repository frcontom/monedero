"use client";

import { addMonths, differenceInCalendarDays, format, parseISO } from "date-fns";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PERIOD_DAYS } from "@/lib/calc/goals";
import { formatMoney } from "@/lib/money";
import type { GoalSummary, Movement } from "@/lib/types";

function buildCurve(goal: GoalSummary, movements: Movement[]) {
  const start = parseISO(goal.startDate);
  const today = new Date();
  const points: { period: string; actual: number; expected: number }[] = [];
  let cursor = start;
  let idx = 0;

  while (cursor <= today && idx < 120) {
    const dateStr = format(cursor, "yyyy-MM-dd");
    const actual = movements
      .filter((m) => m.date <= dateStr)
      .reduce((s, m) => s + (m.type === "deposit" ? m.amount : -m.amount), 0);

    let expected = 0;
    if (goal.planningMode === "PERIODIC" && goal.periodicity && goal.plannedAmount) {
      const periodDays = PERIOD_DAYS[goal.periodicity];
      const periods = Math.floor(differenceInCalendarDays(cursor, start) / periodDays);
      expected = periods * goal.plannedAmount;
    } else if (goal.targetDate) {
      const totalDays = Math.max(
        1,
        differenceInCalendarDays(parseISO(goal.targetDate), start),
      );
      const elapsed = Math.min(
        Math.max(differenceInCalendarDays(cursor, start), 0),
        totalDays,
      );
      expected = (goal.targetAmount * elapsed) / totalDays;
    }

    points.push({ period: format(cursor, "MMM yy"), actual, expected });
    cursor = addMonths(cursor, 1);
    idx++;
  }

  return points;
}

export function ProgressCurve({
  goal,
  movements,
}: {
  goal: GoalSummary;
  movements: Movement[];
}) {
  const data = buildCurve(goal, movements);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis dataKey="period" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
            width={44}
          />
          <Tooltip
            formatter={(value) => formatMoney(Math.round(Number(value)))}
            labelFormatter={(label) => `Periodo: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Real"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="expected"
            name="Esperado"
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}