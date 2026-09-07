"use client";

const SEGMENTS = [20, 40, 60, 80, 100];

function fillColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-lime-500";
  if (pct >= 40) return "bg-amber-400";
  if (pct >= 20) return "bg-orange-500";
  return "bg-red-500";
}

export function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct));

  return (
    <div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="absolute inset-0 grid grid-cols-5">
          {SEGMENTS.map((s, i) => (
            <div
              key={s}
              className={`border-r last:border-0 ${
                i % 2 === 0 ? "border-black/10 dark:border-white/10" : "border-black/5 dark:border-white/5"
              }`}
            />
          ))}
        </div>
        <div
          className={`relative h-full rounded-full ${fillColor(clamped)} transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="mt-1 grid grid-cols-5 text-center text-[10px] font-medium">
        {SEGMENTS.map((s) => (
          <span
            key={s}
            className={clamped >= s ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}
          >
            {s}%
          </span>
        ))}
      </div>
    </div>
  );
}