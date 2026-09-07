import type {
  AnalyticsData,
  DashboardData,
  GoalDetail,
  GoalSummary,
  Movement,
  ProjectionData,
} from "@/lib/types";
import type { GoalInput, MovementInput } from "@/lib/validators/goal";

const jsonHeaders = { "Content-Type": "application/json" };

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(body?.error?.message ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listGoals: () => fetch("/api/goals").then(handle<{ goals: GoalSummary[] }>),
  getGoal: (id: string) =>
    fetch(`/api/goals/${id}`).then(handle<{ goal: GoalDetail }>),
  createGoal: (data: GoalInput) =>
    fetch("/api/goals", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(data),
    }).then(handle<{ goal: GoalSummary }>),
  updateGoal: (id: string, data: GoalInput) =>
    fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(data),
    }).then(handle<{ goal: GoalSummary }>),
  setStatus: (id: string, status: GoalSummary["status"]) =>
    fetch(`/api/goals/${id}/status`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ status }),
    }).then(handle<{ goal: GoalSummary }>),
  deleteGoal: (id: string) =>
    fetch(`/api/goals/${id}`, { method: "DELETE" }).then(handle<{ goal: GoalSummary }>),
  listMovements: (goalId: string) =>
    fetch(`/api/goals/${goalId}/movements`).then(
      handle<{ movements: Movement[]; total: number }>,
    ),
  addMovement: (goalId: string, data: MovementInput) =>
    fetch(`/api/goals/${goalId}/movements`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(data),
    }).then(handle<{ movement: Movement }>),
  updateMovement: (goalId: string, movementId: string, data: MovementInput) =>
    fetch(`/api/goals/${goalId}/movements/${movementId}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(data),
    }).then(handle<{ movement: Movement }>),
  deleteMovement: (goalId: string, movementId: string) =>
    fetch(`/api/goals/${goalId}/movements/${movementId}`, { method: "DELETE" }).then(
      handle<{ deleted: true }>,
    ),
  dashboard: () => fetch("/api/dashboard").then(handle<DashboardData>),
  journal: (month: string) =>
    fetch(`/api/journal?month=${month}`).then(
      handle<{ entries: { id: string; goalId: string; goalName: string; date: string; type: "deposit" | "withdrawal"; amount: number; description: string | null }[] }>,
    ),
  projection: (goalId: string) =>
    fetch(`/api/goals/${goalId}/projection`).then(handle<ProjectionData>),
  analytics: (goalId: string) =>
    fetch(`/api/goals/${goalId}/analytics`).then(handle<AnalyticsData>),
};