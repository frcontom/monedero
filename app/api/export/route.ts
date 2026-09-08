import { eq } from "drizzle-orm";
import { runApi, error, json } from "@/lib/http";
import { requireUserId } from "@/lib/session";
import { listGoals } from "@/lib/repo/goals";
import { db } from "@/lib/db";
import { goals, movements } from "@/drizzle/schema";

function toCSV(headers: string[], rows: (string | number | null)[][]): string {
  const esc = (v: string | number | null) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}

export async function GET(request: Request) {
  return runApi(async () => {
    const userId = await requireUserId();
    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? "goals";
    const format = url.searchParams.get("format") ?? "csv";

    if (type !== "goals" && type !== "movements") {
      return error(400, "INVALID_TYPE", "Tipo inválido (goals|movements)");
    }
    if (format !== "csv" && format !== "json") {
      return error(400, "INVALID_FORMAT", "Formato inválido (csv|json)");
    }

    if (type === "goals") {
      const list = await listGoals(userId);
      if (format === "json") return json(list);
      const headers = [
        "id", "name", "category", "status", "targetAmount", "accumulated",
        "remaining", "progressPct", "startDate", "targetDate", "planningMode",
        "periodicity", "plannedAmount", "dateMode", "performanceStatus",
      ];
      const rows = list.map((g) => [
        g.id, g.name, g.category, g.status, g.targetAmount, g.accumulated,
        g.remaining, Math.round(g.progressPct * 100) / 100, g.startDate,
        g.targetDate ?? "", g.planningMode, g.periodicity ?? "", g.plannedAmount ?? "",
        g.dateMode, g.performanceStatus,
      ]);
      return new Response(toCSV(headers, rows), {
        headers: { "Content-Type": "text/csv; charset=utf-8" },
      });
    }

    const rows = await db
      .select({ goal: goals, mov: movements })
      .from(movements)
      .innerJoin(goals, eq(movements.goalId, goals.id))
      .where(eq(goals.userId, userId))
      .orderBy(movements.date);
    const data = rows.map(({ goal, mov }) => ({
      id: mov.id,
      goalId: mov.goalId,
      goal: goal.name,
      date: mov.date,
      type: mov.type,
      amount: mov.amount,
      description: mov.description,
      createdAt: mov.createdAt.toISOString(),
    }));
    if (format === "json") return json(data);
    const headers = ["id", "goalId", "goal", "date", "type", "amount", "description", "createdAt"];
    const csvRows = data.map((d) => [
      d.id, d.goalId, d.goal, d.date, d.type, d.amount, d.description ?? "", d.createdAt,
    ]);
    return new Response(toCSV(headers, csvRows), {
      headers: { "Content-Type": "text/csv; charset=utf-8" },
    });
  });
}