"use client";

import { differenceInCalendarDays, format, parseISO } from "date-fns";
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

function expectedAt(goal: GoalSummary, start: Date, date: Date): number {
  if (goal.planningMode === "PERIODIC" && goal.periodicity && goal.plannedAmount) {
    const periodDays = PERIOD_DAYS[goal.periodicity];
    const periods = Math.floor(differenceInCalendarDays(date, start) / periodDays);
    return periods * goal.plannedAmount;
  }
  if (goal.targetDate) {
    const totalDays = Math.max(
      1,
      differenceInCalendarDays(parseISO(goal.targetDate), start),
    );
    const elapsed = Math.min(Math.max(differenceInCalendarDays(date, start), 0), totalDays);
    return (goal.targetAmount * elapsed) / totalDays;
  }
  return 0;
}

function buildCurve(goal: GoalSummary, movements: Movement[]) {
  const start = parseISO(goal.startDate);
  const today = new Date();

  const dateSet = new Set<number>([start.getTime()]);
  for (const m of movements) {
    const p = parseISO(m.date);
    if (p >= start && p <= today) dateSet.add(p.getTime());
  }
  dateSet.add(today.getTime());

  const dates = [...dateSet].sort((a, b) => a - b).map((t) => new Date(t));

  let points = dates.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const actual = movements
      .filter((m) => m.date <= dateStr)
      .reduce((s, m) => s + (m.type === "deposit" ? m.amount : -m.amount), 0);
    return {
      period: format(date, "dd/MM"),
      actual,
      expected: expectedAt(goal, start, date),
    };
  });

  if (points.length > 60) {
    const step = Math.ceil(points.length / 60);
    points = points.filter((_, i) => i % step === 0);
    if (points[points.length - 1].period !== format(today, "dd/MM")) {
      points.push({
        period: format(today, "dd/MM"),
        actual: movements.reduce(
          (s, m) => s + (m.type === "deposit" ? m.amount : -m.amount),
          0,
        ),
        expected: expectedAt(goal, start, today),
      });
    }
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
            tickFormatter={(v: number) => `${Math.round(Number(v) / 1000)}k`}
            width={44}
          />
          <Tooltip
            formatter={(value) => formatMoney(Math.round(Number(value)))}
            labelFormatter={(label) => `Fecha: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Real"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3 }}
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