"use client";

import { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/lib/client/hooks";

type Editing = { id: string; name: string; icon: string; color: string } | null;

export function CategoriesView() {
  const { data, isLoading } = useCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📌");
  const [newColor, setNewColor] = useState("#64748b");
  const [editing, setEditing] = useState<Editing>(null);
  const [error, setError] = useState<string | null>(null);

  const submitCreate = () => {
    if (!newName.trim()) return;
    setError(null);
    create.mutate(
      { name: newName.trim(), icon: newIcon || "📌", color: newColor },
      {
        onSuccess: () => {
          setNewName("");
          setNewIcon("📌");
          setNewColor("#64748b");
        },
        onError: (e) => setError(e.message),
      },
    );
  };

  const submitEdit = () => {
    if (!editing) return;
    setError(null);
    update.mutate(
      { id: editing.id, data: { name: editing.name, icon: editing.icon, color: editing.color } },
      { onSuccess: () => setEditing(null), onError: (e) => setError(e.message) },
    );
  };

  const inputClass =
    "rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Categorías</h2>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <h3 className="mb-2 text-sm font-medium">Nueva categoría</h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            placeholder="Ícono"
            className={`${inputClass} w-14 text-center`}
            maxLength={8}
          />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre (ej. Educación)"
            className={`${inputClass} flex-1`}
          />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600"
            aria-label="Color"
          />
          <button
            onClick={submitCreate}
            disabled={create.isPending || !newName.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Agregar
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Cargando…</p>}

      <div className="flex flex-col gap-2">
        {data?.categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5"
          >
            {editing?.id === c.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={editing.icon}
                  onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                  className={`${inputClass} w-14 text-center`}
                  maxLength={8}
                />
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="color"
                  value={editing.color}
                  onChange={(e) => setEditing({ ...editing, color: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600"
                  aria-label="Color"
                />
                <button onClick={submitEdit} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">
                  Guardar
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-base"
                    style={{ backgroundColor: `${c.color}22` }}
                  >
                    {c.icon}
                  </span>
                  <span className="font-medium">{c.name}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing({ id: c.id, name: c.name, icon: c.icon, color: c.color })}
                    className="rounded-lg px-2 py-1 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Eliminar la categoría "${c.name}"?`)) {
                        setError(null);
                        del.mutate(c.id, { onError: (e) => setError(e.message) });
                      }
                    }}
                    className="rounded-lg px-2 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    🗑
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}