"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      {!editing ? (
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className={`font-semibold ${isDeposit ? "text-emerald-700" : "text-red-700"}`}>
              {isDeposit ? "+" : "−"} {formatMoney(movement.amount)}
            </p>
            <p className="text-xs text-slate-500">
              {formatDate(movement.date)}
              {movement.description ? ` · ${movement.description}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
            >
              Editar
            </button>
            <button
              onClick={() => del.mutate(movement.id, { onError: (e) => setError(e.message) })}
              className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "deposit" | "withdrawal")}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="deposit">Aporte</option>
              <option value="withdrawal">Retiro</option>
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción"
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
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
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}