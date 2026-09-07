import "server-only";
import { and, eq, gte, lt } from "drizzle-orm";
import { addMonths, format, parseISO } from "date-fns";
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