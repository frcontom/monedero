import "server-only";
import { addDays, format } from "date-fns";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { movements } from "@/drizzle/schema";
import { listGoals, requireOwnedGoal } from "@/lib/repo/goals";
import {
  PERIOD_DAYS,
  accumulated,
  daysSinceStart,
  daysUntilTarget,
  expectedAccumulated,
  hasReference,
  performanceStatus,
  projectedDate,
  requiredRates,
  todayLocal,
  type PlanRef,
} from "@/lib/calc/goals";
import type {
  DashboardData,
  ProjectionData,
  AnalyticsData,
  Movement as MovementDto,
} from "@/lib/types";
import type { Movement } from "@/drizzle/schema";

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

function periodDaysOf(p: "DAILY" | "WEEKLY" | "MONTHLY"): number {
  return PERIOD_DAYS[p];
}

export async function getDashboard(userId: string): Promise<DashboardData> {
  const summaries = await listGoals(userId);
  const active = summaries.filter((g) => g.status !== "CANCELLED");

  const targetAmount = active.reduce((s, g) => s + g.targetAmount, 0);
  const accumulatedTotal = active.reduce((s, g) => s + g.accumulated, 0);

  const byStatus = { active: 0, paused: 0, completed: 0, cancelled: 0 };
  for (const g of summaries) {
    if (g.status in byStatus) byStatus[g.status.toLowerCase() as keyof typeof byStatus]++;
  }

  const performance = { achieved: 0, onTrack: 0, needsAttention: 0, behind: 0 };
  for (const g of active) {
    switch (g.performanceStatus) {
      case "OBJETIVO_ALCANZADO":
        performance.achieved++;
        break;
      case "EN_RITMO":
        performance.onTrack++;
        break;
      case "NECESITA_ATENCION":
        performance.needsAttention++;
        break;
      case "ATRASADA":
        performance.behind++;
        break;
    }
  }

  const activeIds = active.map((g) => g.id);
  const recentRows = activeIds.length
    ? await db
        .select()
        .from(movements)
        .where(inArray(movements.goalId, activeIds))
        .orderBy(desc(movements.date), desc(movements.createdAt))
        .limit(10)
    : [];

  return {
    totals: {
      goals: active.length,
      targetAmount,
      accumulated: accumulatedTotal,
      remaining: active.reduce((s, g) => s + g.remaining, 0),
      progressPct: targetAmount > 0 ? (accumulatedTotal / targetAmount) * 100 : 0,
    },
    byStatus,
    performance,
    recentActivity: recentRows.map(toDto),
  };
}

export async function getProjection(userId: string, goalId: string): Promise<ProjectionData> {
  const goal = await requireOwnedGoal(userId, goalId);
  const movs = await db.select().from(movements).where(eq(movements.goalId, goalId));

  const acc = accumulated(movs);
  const remainingAmount = Math.max(0, goal.targetAmount - acc);
  const today = todayLocal();

  const ref: PlanRef = {
    startDate: goal.startDate,
    targetDate: goal.targetDate,
    planningMode: goal.planningMode,
    periodicity: goal.periodicity,
    plannedAmount: goal.plannedAmount,
    targetAmount: goal.targetAmount,
  };
  const expected = expectedAccumulated(ref, today);
  const reference = hasReference(ref);

  const hasDeadline = goal.targetDate !== null && goal.targetDate >= today;
  const daysLeft = hasDeadline ? daysUntilTarget(goal.targetDate as string, today) : null;
  const rates = hasDeadline && daysLeft !== null
    ? requiredRates(remainingAmount, daysLeft)
    : { daily: null, weekly: null, monthly: null };

  let projectionDate: string | null = null;
  let projectionBasis: ProjectionData["projectionBasis"] = "NONE";
  let explanation = "Sin datos suficientes para proyectar.";

  if (goal.planningMode === "PERIODIC" && goal.periodicity && goal.plannedAmount) {
    const perDay = goal.plannedAmount / periodDaysOf(goal.periodicity);
    if (perDay > 0) {
      const days = Math.ceil(remainingAmount / perDay);
      projectionDate = format(addDays(new Date(), days), "yyyy-MM-dd");
      projectionBasis = "PLAN";
      explanation = "Proyección basada en tu plan de aportes periódicos.";
    }
  } else if (acc > 0) {
    const calcDate = projectedDate({
      startDate: goal.startDate,
      today,
      accumulatedAmount: acc,
      remainingAmount,
    });
    if (calcDate) {
      projectionDate = calcDate;
      projectionBasis = "HISTORICAL";
      explanation = "Proyección basada en tu ritmo histórico de aportes.";
    }
  }

  const behind = Math.max(0, expected - acc);
  const lastMovementDate = movs.length
    ? movs.reduce((max, m) => (m.date > max ? m.date : max), movs[0].date)
    : null;
  const lastMovementDaysAgo = lastMovementDate
    ? Math.max(0, Math.round((Date.now() - Date.parse(lastMovementDate)) / 86_400_000))
    : null;

  return {
    remaining: remainingAmount,
    requiredDaily: rates.daily,
    requiredWeekly: rates.weekly,
    requiredMonthly: rates.monthly,
    projectedDate: projectionDate,
    projectionBasis,
    estimate: true,
    explanation,
    performanceStatus: performanceStatus({
      targetAmount: goal.targetAmount,
      accumulatedAmount: acc,
      expected,
      reference,
    }),
    behind,
    recoveryAmount: behind > 0 && rates.daily !== null ? behind + rates.daily : 0,
    lastMovementDaysAgo,
  };
}

export async function getAnalytics(userId: string, goalId: string): Promise<AnalyticsData> {
  const goal = await requireOwnedGoal(userId, goalId);
  const movs = await db.select().from(movements).where(eq(movements.goalId, goalId));

  const byMonth = new Map<string, { month: string; deposits: number; withdrawals: number; net: number }>();
  for (const m of movs) {
    const month = m.date.slice(0, 7);
    const bucket = byMonth.get(month) ?? { month, deposits: 0, withdrawals: 0, net: 0 };
    if (m.type === "deposit") bucket.deposits += m.amount;
    else bucket.withdrawals += m.amount;
    bucket.net = bucket.deposits - bucket.withdrawals;
    byMonth.set(month, bucket);
  }

  const deposits = movs.filter((m) => m.type === "deposit");
  const averageDeposit = deposits.length
    ? Math.round(deposits.reduce((s, m) => s + m.amount, 0) / deposits.length)
    : 0;

  const points: AnalyticsData["planVsActual"]["points"] = [];
  if (goal.planningMode === "PERIODIC" && goal.periodicity && goal.plannedAmount) {
    const periodDays = periodDaysOf(goal.periodicity);
    const elapsed = daysSinceStart(goal.startDate, todayLocal());
    const periodsElapsed = Math.floor(elapsed / periodDays);
    for (let i = 0; i <= periodsElapsed; i++) {
      const periodEnd = format(
        addDays(new Date(goal.startDate), i * periodDays),
        "yyyy-MM-dd",
      );
      const actual = movs
        .filter((m) => m.date <= periodEnd)
        .reduce((s, m) => s + (m.type === "deposit" ? m.amount : -m.amount), 0);
      points.push({ period: i, expected: i * goal.plannedAmount, actual });
    }
  }

  return {
    contributions: [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month)),
    averageDeposit,
    frequency: {
      total: movs.length,
      daysWithActivity: new Set(movs.map((m) => m.date)).size,
      deposits: deposits.length,
      withdrawals: movs.length - deposits.length,
    },
    planVsActual: { points },
  };
}