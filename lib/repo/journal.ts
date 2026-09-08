import "server-only";
import { and, eq, gte, lt } from "drizzle-orm";
import { addDays, addMonths, format, parseISO, startOfDay, subWeeks } from "date-fns";
import { db } from "@/lib/db";
import { goals, movements } from "@/drizzle/schema";

export type JournalEntry = {
  id: string;
  goalId: string;
  goalName: string;
  date: string;
  type: "deposit" | "withdrawal";
  amount: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getMonthActivity(userId: string, month: string): Promise<JournalEntry[]> {
  const start = `${month}-01`;
  const end = format(addMonths(parseISO(start), 1), "yyyy-MM-dd");

  const rows = await db
    .select({ m: movements, goal: goals })
    .from(movements)
    .innerJoin(goals, eq(movements.goalId, goals.id))
    .where(and(eq(goals.userId, userId), gte(movements.date, start), lt(movements.date, end)))
    .orderBy(movements.date, movements.createdAt);

  return rows.map(({ m, goal }) => ({
    id: m.id,
    goalId: m.goalId,
    goalName: goal.name,
    date: m.date,
    type: m.type,
    amount: m.amount,
    description: m.description,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));
}

export type HeatmapDay = { date: string; amount: number };

export async function getHeatmap(userId: string, weeks = 16): Promise<HeatmapDay[]> {
  const today = startOfDay(new Date());
  const start = subWeeks(today, weeks - 1);
  const startStr = format(start, "yyyy-MM-dd");

  const rows = await db
    .select({ date: movements.date, amount: movements.amount })
    .from(movements)
    .innerJoin(goals, eq(movements.goalId, goals.id))
    .where(
      and(
        eq(goals.userId, userId),
        eq(movements.type, "deposit"),
        gte(movements.date, startStr),
        lt(movements.date, format(addDays(today, 1), "yyyy-MM-dd")),
      ),
    );

  const byDate = new Map<string, number>();
  for (const r of rows) {
    byDate.set(r.date, (byDate.get(r.date) ?? 0) + r.amount);
  }

  const days: HeatmapDay[] = [];
  let cursor = start;
  while (cursor <= today) {
    const d = format(cursor, "yyyy-MM-dd");
    days.push({ date: d, amount: byDate.get(d) ?? 0 });
    cursor = addDays(cursor, 1);
  }

  return days;
}