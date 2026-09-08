"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  format,
  isSameMonth,
  parseISO,
  startOfWeek,
} from "date-fns";
import { useJournal, useJournalHeatmap } from "@/lib/client/hooks";
import { formatMoney } from "@/lib/money";
import { ContributionHeatmap } from "@/components/journal/contribution-heatmap";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

type Entry = {
  id: string;
  goalId: string;
  goalName: string;
  date: string;
  type: "deposit" | "withdrawal";
  amount: number;
  description: string | null;
};

export function JournalView() {
  const [monthStr, setMonthStr] = useState(format(new Date(), "yyyy-MM"));
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading } = useJournal(monthStr);
  const heatmap = useJournalHeatmap(16);

  const monthStart = parseISO(`${monthStr}-01`);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridDays = eachDayOfInterval({ start: gridStart, end: addDays(gridStart, 41) });

  const byDay = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of data?.entries ?? []) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [data]);

  const selectedEntries = selected ? byDay.get(selected) ?? [] : [];

  const netOf = (entries: Entry[]) =>
    entries.reduce((s, e) => s + (e.type === "deposit" ? e.amount : -e.amount), 0);

  const prev = () => setMonthStr(format(addMonths(monthStart, -1), "yyyy-MM"));
  const next = () => setMonthStr(format(addMonths(monthStart, 1), "yyyy-MM"));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Journal</h1>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700">
            ‹
          </button>
          <span className="w-28 text-center font-medium capitalize">{format(monthStart, "MMMM yyyy")}</span>
          <button onClick={next} className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700">
            ›
          </button>
        </div>
      </div>

      {heatmap.data ? (
        <ContributionHeatmap days={heatmap.data.days} />
      ) : null}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {gridDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const entries = byDay.get(dateStr) ?? [];
            const inMonth = isSameMonth(day, monthStart);
            const isSelected = selected === dateStr;
            const net = netOf(entries);
            return (
              <button
                key={dateStr}
                onClick={() => setSelected(isSelected ? null : dateStr)}
                className={`flex h-16 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 text-sm transition md:h-20 ${
                  !inMonth ? "text-slate-300" : isSelected ? "bg-blue-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <span className="text-base font-semibold md:text-lg">{format(day, "d")}</span>
                {entries.length > 0 && (
                  <span
                    className={`w-full truncate text-center text-[11px] leading-none md:text-xs ${
                      isSelected ? "text-white" : net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {net >= 0 ? "+" : "−"}
                    {formatMoney(Math.abs(net))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <h2 className="mb-2 font-semibold">
          {selected ? format(parseISO(selected), "dd/MM/yyyy") : "Selecciona un día"}
        </h2>
        {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Cargando…</p>}
        {!isLoading && selected && selectedEntries.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Sin movimientos este día.</p>
        )}
        {!selected && <p className="text-sm text-slate-500 dark:text-slate-400">Toca un día para ver sus movimientos.</p>}
        {selectedEntries.length > 0 && (
          <div className="flex flex-col gap-2">
            {selectedEntries.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2">
                <div>
                  <p className={`font-semibold ${e.type === "deposit" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                    {e.type === "deposit" ? "+" : "−"} {formatMoney(e.amount)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {e.goalName}
                    {e.description ? ` · ${e.description}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}