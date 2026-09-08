"use client";

import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { formatMoney } from "@/lib/money";

type HeatmapDay = { date: string; amount: number };

function colorFor(amount: number, max: number): string {
  if (amount <= 0) return "bg-slate-100 dark:bg-slate-800";
  const r = amount / max;
  if (r < 0.25) return "bg-emerald-200 dark:bg-emerald-900";
  if (r < 0.5) return "bg-emerald-400 dark:bg-emerald-700";
  if (r < 0.75) return "bg-emerald-600 dark:bg-emerald-500";
  return "bg-emerald-800 dark:bg-emerald-300";
}

export function ContributionHeatmap({ days }: { days: HeatmapDay[] }) {
  if (days.length === 0) return null;

  const dayMap = new Map(days.map((d) => [d.date, d.amount]));
  const max = Math.max(...days.map((d) => d.amount), 1);
  const gridStart = startOfWeek(parseISO(days[0].date), { weekStartsOn: 1 });

  const offset = (parseISO(days[0].date).getDay() + 6) % 7;
  const cols = Math.ceil((days.length + offset) / 7);
  const lastDate = days[days.length - 1].date;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <h2 className="mb-3 font-semibold">Constancia</h2>
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1">
          {Array.from({ length: cols }).map((_, w) => (
            <div key={w} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, d) => {
                const date = addDays(gridStart, w * 7 + d);
                const ds = format(date, "yyyy-MM-dd");
                const amount = dayMap.get(ds) ?? 0;
                const inRange = ds >= days[0].date && ds <= lastDate;
                return (
                  <div
                    key={d}
                    title={`${format(date, "dd/MM/yyyy")}: ${amount > 0 ? formatMoney(amount) : "Sin aportes"}`}
                    className={`h-3.5 w-3.5 rounded-[3px] ${
                      inRange ? colorFor(amount, max) : "bg-transparent"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-slate-400">
        <span>Menos</span>
        <span className="h-3 w-3 rounded-[3px] bg-slate-100 dark:bg-slate-800" />
        <span className="h-3 w-3 rounded-[3px] bg-emerald-200 dark:bg-emerald-900" />
        <span className="h-3 w-3 rounded-[3px] bg-emerald-400 dark:bg-emerald-700" />
        <span className="h-3 w-3 rounded-[3px] bg-emerald-600 dark:bg-emerald-500" />
        <span className="h-3 w-3 rounded-[3px] bg-emerald-800 dark:bg-emerald-300" />
        <span>Más</span>
      </div>
    </div>
  );
}