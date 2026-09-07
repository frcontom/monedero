"use client";

const SEGMENTS = [
  { end: 20, color: "bg-red-500" },
  { end: 40, color: "bg-orange-500" },
  { end: 60, color: "bg-amber-400" },
  { end: 80, color: "bg-lime-500" },
  { end: 100, color: "bg-emerald-500" },
];

export function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct));

  return (
    <div>
      <div className="flex gap-1">
        {SEGMENTS.map((seg, i) => {
          const start = i * 20;
          const segFill = Math.min(100, Math.max(0, ((clamped - start) / 20) * 100));
          return (
            <div
              key={seg.end}
              className="h-3 flex-1 overflow-hidden rounded-md bg-slate-200 dark:bg-slate-700"
            >
              <div
                className={`h-full rounded-md ${seg.color} transition-all duration-500`}
                style={{ width: `${segFill}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1">
        {SEGMENTS.map((seg) => (
          <span
            key={seg.end}
            className={`flex-1 text-center text-[10px] font-medium ${
              clamped >= seg.end
                ? "text-slate-700 dark:text-slate-200"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {seg.end}%
          </span>
        ))}
      </div>
    </div>
  );
}