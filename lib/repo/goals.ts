import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { goals, movements } from "@/drizzle/schema";
import { ApiError } from "@/lib/http";
import {
  accumulated,
  expectedAccumulated,
  hasReference,
  performanceStatus,
  progressPct,
  remaining,
  todayLocal,
  type PlanRef,
} from "@/lib/calc/goals";
import type { Goal, Movement } from "@/drizzle/schema";
import type { GoalSummary, Movement as MovementDto } from "@/lib/types";
import type { GoalInput, MovementInput } from "@/lib/validators/goal";

export async function requireOwnedGoal(userId: string, goalId: string): Promise<Goal> {
  const [goal] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1);
  if (!goal) throw new ApiError(404, "NOT_FOUND", "Meta no encontrada");
  return goal;
}

async function movementsOf(goalId: string): Promise<Movement[]> {
  return db.select().from(movements).where(eq(movements.goalId, goalId));
}

function toDto(mov: Movement): MovementDto {
  return {
    id: mov.id,
    goalId: mov.goalId,
    date: mov.date,
    type: mov.type,
    amount: mov.amount,
    description: mov.description,
    createdAt: mov.createdAt.toISOString(),
    updatedAt: mov.updatedAt.toISOString(),
  };
}

function buildSummary(goal: Goal, movs: Movement[]): GoalSummary {
  const acc = accumulated(movs);
  const ref: PlanRef = {
    startDate: goal.startDate,
    targetDate: goal.targetDate,
    planningMode: goal.planningMode,
    periodicity: goal.periodicity,
    plannedAmount: goal.plannedAmount,
    targetAmount: goal.targetAmount,
  };
  const expected = expectedAccumulated(ref, todayLocal());
  const status = performanceStatus({
    targetAmount: goal.targetAmount,
    accumulatedAmount: acc,
    expected,
    reference: hasReference(ref),
  });
  const lastMovementDate = movs.length
    ? movs.reduce((max, m) => (m.date > max ? m.date : max), movs[0].date)
    : null;

  return {
    id: goal.id,
    name: goal.name,
    description: goal.description,
    category: goal.category,
    status: goal.status,
    dateMode: goal.dateMode,
    targetDate: goal.targetDate,
    planningMode: goal.planningMode,
    periodicity: goal.periodicity,
    targetAmount: goal.targetAmount,
    plannedAmount: goal.plannedAmount,
    startDate: goal.startDate,
    accumulated: acc,
    remaining: remaining(goal.targetAmount, acc),
    progressPct: progressPct(goal.targetAmount, acc),
    expected,
    performanceStatus: status,
    lastMovementDate,
  };
}

export async function listGoals(userId: string): Promise<GoalSummary[]> {
  const rows = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(desc(goals.createdAt));

  const ids = rows.map((g) => g.id);
  const allMovements = ids.length
    ? await db.select().from(movements).where(inArray(movements.goalId, ids))
    : [];
  const byGoal = new Map<string, Movement[]>();
  for (const m of allMovements) {
    const list = byGoal.get(m.goalId) ?? [];
    list.push(m);
    byGoal.set(m.goalId, list);
  }

  return rows.map((g) => buildSummary(g, byGoal.get(g.id) ?? []));
}

export async function getGoalDetail(userId: string, goalId: string) {
  const goal = await requireOwnedGoal(userId, goalId);
  const movs = await movementsOf(goalId);
  return { summary: buildSummary(goal, movs), movements: movs.map(toDto) };
}

export async function createGoal(userId: string, data: GoalInput): Promise<Goal> {
  const [goal] = await db
    .insert(goals)
    .values({
      userId,
      name: data.name,
      description: data.description ?? null,
      targetAmount: data.targetAmount,
      startDate: data.startDate,
      dateMode: data.dateMode,
      targetDate: data.dateMode === "TARGET_DATE" ? data.targetDate : null,
      planningMode: data.planningMode,
      periodicity: data.planningMode === "PERIODIC" ? data.periodicity : null,
      plannedAmount: data.planningMode === "PERIODIC" ? data.plannedAmount : null,
      category: data.category,
    })
    .returning();
  return goal;
}

export async function updateGoal(userId: string, goalId: string, data: GoalInput): Promise<Goal> {
  await requireOwnedGoal(userId, goalId);
  const [goal] = await db
    .update(goals)
    .set({
      name: data.name,
      description: data.description ?? null,
      targetAmount: data.targetAmount,
      startDate: data.startDate,
      dateMode: data.dateMode,
      targetDate: data.dateMode === "TARGET_DATE" ? data.targetDate : null,
      planningMode: data.planningMode,
      periodicity: data.planningMode === "PERIODIC" ? data.periodicity : null,
      plannedAmount: data.planningMode === "PERIODIC" ? data.plannedAmount : null,
      category: data.category,
      updatedAt: new Date(),
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();
  return goal;
}

export async function setGoalStatus(
  userId: string,
  goalId: string,
  status: Goal["status"],
): Promise<Goal> {
  const goal = await requireOwnedGoal(userId, goalId);

  if (status === "COMPLETED") {
    const movs = await movementsOf(goalId);
    if (accumulated(movs) < goal.targetAmount) {
      throw new ApiError(409, "COMPLETION_NOT_MET", "La meta aún no alcanza su objetivo");
    }
  }

  const [updated] = await db
    .update(goals)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();
  return updated;
}

export async function deleteGoal(userId: string, goalId: string) {
  const result = await db
    .delete(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning({ id: goals.id });
  if (result.length === 0) throw new ApiError(404, "NOT_FOUND", "Meta no encontrada");
  return true;
}

export async function listMovements(
  userId: string,
  goalId: string,
  limit = 100,
  offset = 0,
): Promise<{ movements: MovementDto[]; total: number }> {
  await requireOwnedGoal(userId, goalId);
  const rows = await db
    .select()
    .from(movements)
    .where(eq(movements.goalId, goalId))
    .orderBy(desc(movements.date), desc(movements.createdAt))
    .limit(limit)
    .offset(offset);
  const [countRow] = await db
    .select({ value: sql<string>`count(*)` })
    .from(movements)
    .where(eq(movements.goalId, goalId));
  return { movements: rows.map(toDto), total: Number(countRow.value) };
}

export async function addMovement(
  userId: string,
  goalId: string,
  data: MovementInput,
): Promise<MovementDto> {
  await requireOwnedGoal(userId, goalId);
  const [mov] = await db
    .insert(movements)
    .values({
      goalId,
      date: data.date,
      type: data.type,
      amount: data.amount,
      description: data.description ?? null,
    })
    .returning();
  return toDto(mov);
}

export async function updateMovement(
  userId: string,
  goalId: string,
  movementId: string,
  data: Partial<MovementInput>,
): Promise<MovementDto> {
  await requireOwnedGoal(userId, goalId);
  const [existing] = await db
    .select()
    .from(movements)
    .where(and(eq(movements.id, movementId), eq(movements.goalId, goalId)))
    .limit(1);
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Movimiento no encontrado");

  const [updated] = await db
    .update(movements)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(movements.id, movementId), eq(movements.goalId, goalId)))
    .returning();
  return toDto(updated);
}

export async function deleteMovement(userId: string, goalId: string, movementId: string) {
  await requireOwnedGoal(userId, goalId);
  const result = await db
    .delete(movements)
    .where(and(eq(movements.id, movementId), eq(movements.goalId, goalId)))
    .returning({ id: movements.id });
  if (result.length === 0) throw new ApiError(404, "NOT_FOUND", "Movimiento no encontrado");
  return true;
}