import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, goals } from "@/drizzle/schema";
import { ApiError } from "@/lib/http";

export const DEFAULT_CATEGORIES = [
  { name: "AHORRO", color: "#3b82f6", icon: "💰" },
  { name: "COMPRA", color: "#f97316", icon: "🛒" },
  { name: "DEUDA", color: "#ef4444", icon: "💳" },
  { name: "VIAJE", color: "#6366f1", icon: "✈️" },
  { name: "FONDO", color: "#10b981", icon: "🏦" },
  { name: "OTRO", color: "#64748b", icon: "📌" },
];

export async function ensureDefaultCategories(userId: string) {
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.userId, userId))
    .limit(1);
  if (existing.length > 0) return;
  await db
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((c) => ({ userId, ...c })))
    .onConflictDoNothing();
}

export async function listCategories(userId: string) {
  await ensureDefaultCategories(userId);
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name);
}

export async function createCategory(
  userId: string,
  data: { name: string; color: string; icon: string },
) {
  await ensureDefaultCategories(userId);
  const name = data.name.trim();
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, name)))
    .limit(1);
  if (existing.length > 0) {
    throw new ApiError(409, "CATEGORY_EXISTS", "Ya existe una categoría con ese nombre");
  }
  const [cat] = await db
    .insert(categories)
    .values({ userId, name, color: data.color, icon: data.icon })
    .returning();
  return cat;
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  data: { name?: string; color?: string; icon?: string },
) {
  const [existing] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Categoría no encontrada");

  const newName = (data.name ?? existing.name).trim();
  if (newName !== existing.name) {
    const dup = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.name, newName)))
      .limit(1);
    if (dup.length > 0) {
      throw new ApiError(409, "CATEGORY_EXISTS", "Ya existe una categoría con ese nombre");
    }
  }

  await db
    .update(goals)
    .set({ category: newName })
    .where(and(eq(goals.userId, userId), eq(goals.category, existing.name)));

  const [updated] = await db
    .update(categories)
    .set({
      name: newName,
      color: data.color ?? existing.color,
      icon: data.icon ?? existing.icon,
      updatedAt: new Date(),
    })
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning();
  return updated;
}

export async function deleteCategory(userId: string, categoryId: string) {
  const [existing] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Categoría no encontrada");

  const [countRow] = await db
    .select({ value: sql<string>`count(*)` })
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.category, existing.name)));
  if (Number(countRow.value) > 0) {
    throw new ApiError(
      409,
      "CATEGORY_IN_USE",
      "La categoría está en uso por metas. Edítala o cambia esas metas primero.",
    );
  }

  await db
    .delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
  return true;
}

export async function ensureCategory(userId: string, name: string) {
  if (!name || !name.trim()) return;
  await ensureDefaultCategories(userId);
  const clean = name.trim();
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, clean)))
    .limit(1);
  if (existing.length === 0) {
    await db
      .insert(categories)
      .values({ userId, name: clean, color: "#64748b", icon: "📌" })
      .onConflictDoNothing();
  }
}