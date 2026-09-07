"use client";

import { useState } from "react";
import { useGoals } from "@/lib/client/hooks";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalModal } from "@/components/goals/goal-modal";

export function MetasView() {
  const { data, isLoading, isError, error } = useGoals();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Metas</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Nueva meta
        </button>
      </div>

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}
      {isError && <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>}

      {data && data.goals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 p-8 text-center text-slate-500 dark:text-slate-400">
          Aún no tienes metas. Crea la primera para empezar a ahorrar.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {data?.goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
      </div>

      <GoalModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}