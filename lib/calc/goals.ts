import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

export const PERIOD_DAYS = { DAILY: 1, WEEKLY: 7, MONTHLY: 30.4375 } as const;
export type Periodicity = keyof typeof PERIOD_DAYS;

export type MovementLike = {
  type: "deposit" | "withdrawal";
  amount: number;
};

export function todayLocal(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function computeStreaks(depositDates: string[], today: string = todayLocal()): { current: number; best: number } {
  const unique = [...new Set(depositDates)];
  if (unique.length === 0) return { current: 0, best: 0 };

  const days = unique
    .map((d) => parseISO(d))
    .sort((a, b) => a.getTime() - b.getTime());

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (differenceInCalendarDays(days[i], days[i - 1]) === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }

  const todayDate = parseISO(today);
  const last = days[days.length - 1];
  if (differenceInCalendarDays(todayDate, last) > 1) {
    return { current: 0, best };
  }

  const set = new Set(days.map((d) => d.getTime()));
  let current = 1;
  let prev = last;
  for (let i = 1; i < days.length; i++) {
    const p = addDays(prev, -1);
    if (set.has(p.getTime())) {
      current += 1;
      prev = p;
    } else {
      break;
    }
  }

  return { current, best };
}

export function accumulated(movements: MovementLike[]): number {
  return movements.reduce(
    (acc, m) => acc + (m.type === "deposit" ? m.amount : -m.amount),
    0,
  );
}

export function remaining(targetAmount: number, acc: number): number {
  return Math.max(0, targetAmount - acc);
}

export function progressPct(targetAmount: number, acc: number): number {
  if (targetAmount <= 0) return 0;
  return Math.min(100, (acc / targetAmount) * 100);
}

export type PlanRef = {
  startDate: string;
  targetDate: string | null;
  planningMode: "PERIODIC" | "FLEXIBLE";
  periodicity: Periodicity | null;
  plannedAmount: number | null;
  targetAmount: number;
};

export function hasReference(ref: PlanRef): boolean {
  return ref.planningMode === "PERIODIC" || ref.targetDate !== null;
}

export function daysSinceStart(startDate: string, today: string): number {
  return Math.max(1, differenceInCalendarDays(parseISO(today), parseISO(startDate)));
}

export function daysUntilTarget(targetDate: string, today: string): number {
  return Math.max(1, differenceInCalendarDays(parseISO(targetDate), parseISO(today)));
}

export function elapsedDays(startDate: string, today: string): number {
  return Math.max(0, differenceInCalendarDays(parseISO(today), parseISO(startDate)));
}

export function expectedAccumulated(ref: PlanRef, today: string): number {
  const elapsed = elapsedDays(ref.startDate, today);

  if (ref.planningMode === "PERIODIC" && ref.periodicity && ref.plannedAmount !== null) {
    const periodDays = PERIOD_DAYS[ref.periodicity];
    const periods = Math.floor(elapsed / periodDays);
    return periods * ref.plannedAmount;
  }

  if (ref.targetDate) {
    const totalDays = Math.max(
      1,
      differenceInCalendarDays(parseISO(ref.targetDate), parseISO(ref.startDate)),
    );
    const boundedElapsed = Math.min(elapsed, totalDays);
    return (ref.targetAmount * boundedElapsed) / totalDays;
  }

  return 0;
}

export type PerformanceStatus =
  | "EN_RITMO"
  | "NECESITA_ATENCION"
  | "ATRASADA"
  | "OBJETIVO_ALCANZADO"
  | "SIN_REFERENCIA";

export function performanceStatus(params: {
  targetAmount: number;
  accumulatedAmount: number;
  expected: number;
  reference: boolean;
}): PerformanceStatus {
  if (params.accumulatedAmount >= params.targetAmount) return "OBJETIVO_ALCANZADO";
  if (!params.reference) return "SIN_REFERENCIA";
  if (params.expected <= 0) return "EN_RITMO";
  const ratio = params.accumulatedAmount / params.expected;
  if (ratio >= 0.9) return "EN_RITMO";
  if (ratio >= 0.7) return "NECESITA_ATENCION";
  return "ATRASADA";
}

export function requiredRates(remainingAmount: number, daysLeft: number) {
  const daily = remainingAmount / Math.max(1, daysLeft);
  return {
    daily,
    weekly: daily * 7,
    monthly: daily * 30.4375,
  };
}

export function projectedDate(params: {
  startDate: string;
  today: string;
  accumulatedAmount: number;
  remainingAmount: number;
}): string | null {
  const sinceStart = daysSinceStart(params.startDate, params.today);
  const avgDaily = params.accumulatedAmount / sinceStart;
  if (avgDaily <= 0) return null;
  const days = Math.ceil(params.remainingAmount / avgDaily);
  return format(addDays(parseISO(params.today), days), "yyyy-MM-dd");
}

export function behindAmount(expected: number, accumulatedAmount: number): number {
  return Math.max(0, expected - accumulatedAmount);
}

export function recoveryAmount(behind: number, requiredDaily: number): number {
  return behind > 0 ? behind + requiredDaily : 0;
}

export type MonthBucket = {
  month: string;
  deposits: number;
  withdrawals: number;
  net: number;
};

export function byMonth(movements: MovementLike[] & { date: string }[]): MonthBucket[] {
  const map = new Map<string, MonthBucket>();
  for (const m of movements) {
    const month = m.date.slice(0, 7);
    const bucket = map.get(month) ?? { month, deposits: 0, withdrawals: 0, net: 0 };
    if (m.type === "deposit") bucket.deposits += m.amount;
    else bucket.withdrawals += m.amount;
    bucket.net = bucket.deposits - bucket.withdrawals;
    map.set(month, bucket);
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}