"use client";

import { useState } from "react";
import { CategoriesView } from "@/components/config/categories-view";
import { PushSettings } from "@/components/config/push-settings";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ConfigView() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doExport = async (type: "goals" | "movements", format: "csv" | "json") => {
    setError(null);
    setExporting(`${type}-${format}`);
    try {
      const res = await fetch(`/api/export?type=${type}&format=${format}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Error al exportar");
      }
      const text = await res.text();
      const mime = format === "json" ? "application/json" : "text/csv";
      download(`monedero-${type}.${format}`, text, mime);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al exportar");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Configuración</h1>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <h2 className="mb-1 font-semibold">Exportar datos</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Descarga tus metas o movimientos en CSV o JSON (respaldo).
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => doExport("goals", "csv")}
            disabled={exporting !== null}
            className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-60"
          >
            Metas CSV
          </button>
          <button
            onClick={() => doExport("goals", "json")}
            disabled={exporting !== null}
            className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-60"
          >
            Metas JSON
          </button>
          <button
            onClick={() => doExport("movements", "csv")}
            disabled={exporting !== null}
            className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-60"
          >
            Movimientos CSV
          </button>
          <button
            onClick={() => doExport("movements", "json")}
            disabled={exporting !== null}
            className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-60"
          >
            Movimientos JSON
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <PushSettings />

      <CategoriesView />
    </div>
  );
}