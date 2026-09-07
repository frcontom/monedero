"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { MoneyInput } from "@/components/ui/currency-input";
import { useDeleteMovement, useUpdateMovement } from "@/lib/client/hooks";
import type { Movement } from "@/lib/types";

export function MovementRow({ goalId, movement }: { goalId: string; movement: Movement }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(movement.date);
  const [amount, setAmount] = useState(String(movement.amount));
  const [type, setType] = useState<"deposit" | "withdrawal">(movement.type);
  const [description, setDescription] = useState(movement.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const update = useUpdateMovement(goalId);
  const del = useDeleteMovement(goalId);

  const isDeposit = movement.type === "deposit";

  const save = () => {
    const amountValue = Number(amount);
    if (!Number.isInteger(amountValue) || amountValue <= 0) {
      setError("Monto inválido");
      return;
    }
    setError(null);
    update.mutate(
      { movementId: movement.id, data: { date, type, amount: amountValue, description: description || null } },
      { onSuccess: () => setEditing(false), onError: (e) => setError(e.message) },
    );
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "deposit" | "withdrawal")}
              className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-2 py-1.5 text-sm"
            >
              <option value="deposit">Aporte</option>
              <option value="withdrawal">Retiro</option>
            </select>
            <MoneyInput
              value={amount}
              onValueChange={(value) => setAmount(value ?? "")}
              className="w-32 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-2 py-1.5 text-sm"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-2 py-1.5 text-sm"
            />
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción"
            className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-2 py-1.5 text-sm"
          />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={update.isPending}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              Guardar
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
          isDeposit
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
        }`}
      >
        {isDeposit ? "↑" : "↓"}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-semibold leading-tight ${isDeposit ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
          {isDeposit ? "+" : "−"} {formatMoney(movement.amount)}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {movement.description || (isDeposit ? "Aporte" : "Retiro")}
        </p>
      </div>
      <div className="flex shrink-0 gap-0.5">
        <button
          onClick={() => setEditing(true)}
          aria-label="Editar movimiento"
          className="rounded-lg px-2 py-1 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          ✎
        </button>
        <button
          onClick={() => {
            if (window.confirm("¿Eliminar este movimiento?")) {
              del.mutate(movement.id, { onError: (e) => setError(e.message) });
            }
          }}
          aria-label="Eliminar movimiento"
          className="rounded-lg px-2 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
        >
          🗑
        </button>
      </div>
    </div>
  );
}