import type { PerformanceStatus } from "@/lib/calc/goals";

export type GoalSummary = {
  id: string;
  name: string;
  description: string | null;
  category: "AHORRO" | "COMPRA" | "DEUDA" | "VIAJE" | "FONDO" | "OTRO";
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  dateMode: "TARGET_DATE" | "NO_DATE";
  targetDate: string | null;
  planningMode: "PERIODIC" | "FLEXIBLE";
  periodicity: "DAILY" | "WEEKLY" | "MONTHLY" | null;
  targetAmount: number;
  plannedAmount: number | null;
  startDate: string;
  accumulated: number;
  remaining: number;
  progressPct: number;
  expected: number;
  performanceStatus: PerformanceStatus;
  lastMovementDate: string | null;
};

export type Movement = {
  id: string;
  goalId: string;
  date: string;
  type: "deposit" | "withdrawal";
  amount: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GoalDetail = GoalSummary & { movements: Movement[] };

export type DashboardData = {
  totals: {
    goals: number;
    targetAmount: number;
    accumulated: number;
    remaining: number;
    progressPct: number;
  };
  byStatus: {
    active: number;
    paused: number;
    completed: number;
    cancelled: number;
  };
  performance: {
    achieved: number;
    onTrack: number;
    needsAttention: number;
    behind: number;
  };
  recentActivity: Movement[];
};

export type ProjectionData = {
  remaining: number;
  requiredDaily: number | null;
  requiredWeekly: number | null;
  requiredMonthly: number | null;
  projectedDate: string | null;
  projectionBasis: "HISTORICAL" | "PLAN" | "NONE";
  estimate: true;
  explanation: string;
  performanceStatus: PerformanceStatus;
  behind: number;
  recoveryAmount: number;
  lastMovementDaysAgo: number | null;
};

export type AnalyticsData = {
  contributions: {
    month: string;
    deposits: number;
    withdrawals: number;
    net: number;
  }[];
  averageDeposit: number;
  frequency: {
    total: number;
    daysWithActivity: number;
    deposits: number;
    withdrawals: number;
  };
  planVsActual: {
    points: { period: number; expected: number; actual: number }[];
  };
};