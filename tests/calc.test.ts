import { describe, expect, it } from "vitest";
import {
  accumulated,
  behindAmount,
  byMonth,
  daysSinceStart,
  daysUntilTarget,
  expectedAccumulated,
  performanceStatus,
  progressPct,
  projectedDate,
  recoveryAmount,
  remaining,
  requiredRates,
  type PlanRef,
} from "@/lib/calc/goals";

describe("accumulated", () => {
  it("suma aportes y resta retiros", () => {
    expect(
      accumulated([
        { type: "deposit", amount: 500000 },
        { type: "deposit", amount: 400000 },
        { type: "withdrawal", amount: 100000 },
      ]),
    ).toBe(800000);
  });

  it("retorna 0 sin movimientos", () => {
    expect(accumulated([])).toBe(0);
  });
});

describe("remaining / progressPct", () => {
  it("calcula restante sin ir bajo 0", () => {
    expect(remaining(1000000, 300000)).toBe(700000);
    expect(remaining(1000000, 1500000)).toBe(0);
  });

  it("calcula porcentaje con tope 100", () => {
    expect(progressPct(1000000, 250000)).toBe(25);
    expect(progressPct(1000000, 2000000)).toBe(100);
    expect(progressPct(0, 500)).toBe(0);
  });
});

describe("expectedAccumulated", () => {
  const base: PlanRef = {
    startDate: "2026-01-01",
    targetDate: null,
    planningMode: "PERIODIC",
    periodicity: "WEEKLY",
    plannedAmount: 7000,
    targetAmount: 100000,
  };

  it("plan periódico semanal usa periodos completos", () => {
    const ref = { ...base, periodicity: "WEEKLY" as const };
    expect(expectedAccumulated(ref, "2026-01-15")).toBe(14000); // 14 días / 7 = 2 periodos
  });

  it("plan periódico diario", () => {
    const ref = { ...base, periodicity: "DAILY" as const };
    expect(expectedAccumulated(ref, "2026-01-03")).toBe(14000); // 2 días = 2 aportes
  });

  it("sin fecha y flexible no tiene referencia (0)", () => {
    const ref: PlanRef = {
      startDate: "2026-01-01",
      targetDate: null,
      planningMode: "FLEXIBLE",
      periodicity: null,
      plannedAmount: null,
      targetAmount: 100000,
    };
    expect(expectedAccumulated(ref, "2026-03-01")).toBe(0);
  });

  it("con fecha objetivo usa expectativa lineal", () => {
    const ref: PlanRef = {
      startDate: "2026-01-01",
      targetDate: "2026-02-01", // 31 días
      planningMode: "FLEXIBLE",
      periodicity: null,
      plannedAmount: null,
      targetAmount: 310000,
    };
    // 15 días transcurridos de 31 → esperado 150000
    expect(expectedAccumulated(ref, "2026-01-16")).toBe(150000);
  });
});

describe("performanceStatus", () => {
  const ctx = { targetAmount: 100000, accumulatedAmount: 50000, expected: 50000, reference: true };

  it("objetivo alcanzado", () => {
    expect(performanceStatus({ ...ctx, accumulatedAmount: 100000 })).toBe("OBJETIVO_ALCANZADO");
  });

  it("en ritmo (>= 90%)", () => {
    expect(performanceStatus({ ...ctx, accumulatedAmount: 47000, expected: 50000 })).toBe("EN_RITMO");
  });

  it("necesita atención (70-90%)", () => {
    expect(performanceStatus({ ...ctx, accumulatedAmount: 40000, expected: 50000 })).toBe("NECESITA_ATENCION");
  });

  it("atrasada (< 70%)", () => {
    expect(performanceStatus({ ...ctx, accumulatedAmount: 30000, expected: 50000 })).toBe("ATRASADA");
  });

  it("sin referencia", () => {
    expect(performanceStatus({ ...ctx, reference: false })).toBe("SIN_REFERENCIA");
  });

  it("expectativa 0 al inicio → en ritmo", () => {
    expect(performanceStatus({ ...ctx, expected: 0 })).toBe("EN_RITMO");
  });
});

describe("requiredRates", () => {
  it("equivale diario/semanal/mensual", () => {
    const r = requiredRates(310000, 31);
    expect(r.daily).toBeCloseTo(10000, 0);
    expect(r.weekly).toBeCloseTo(70000, 0);
    expect(r.monthly).toBeCloseTo(10000 * 30.4375, 0);
  });

  it("no divide por cero", () => {
    expect(requiredRates(1000, 0).daily).toBe(1000);
  });
});

describe("projectedDate", () => {
  it("proyecta según ritmo histórico", () => {
    const date = projectedDate({
      startDate: "2026-01-01",
      today: "2026-02-01", // 31 días, 310000 acumulado → 10000/día
      accumulatedAmount: 310000,
      remainingAmount: 200000, // → 20 días
    });
    expect(date).toBe("2026-02-21");
  });

  it("sin acumulado no proyecta", () => {
    expect(
      projectedDate({
        startDate: "2026-01-01",
        today: "2026-02-01",
        accumulatedAmount: 0,
        remainingAmount: 200000,
      }),
    ).toBeNull();
  });
});

describe("días y déficit", () => {
  it("daysSinceStart / daysUntilTarget", () => {
    expect(daysSinceStart("2026-01-01", "2026-01-15")).toBe(14);
    expect(daysUntilTarget("2026-02-01", "2026-01-15")).toBe(17);
  });

  it("behind y recovery", () => {
    expect(behindAmount(50000, 30000)).toBe(20000);
    expect(behindAmount(30000, 50000)).toBe(0);
    expect(recoveryAmount(20000, 10000)).toBe(30000);
    expect(recoveryAmount(0, 10000)).toBe(0);
  });
});

describe("byMonth", () => {
  it("agrupa por mes con neto", () => {
    const rows = [
      { date: "2026-01-05", type: "deposit" as const, amount: 100000 },
      { date: "2026-01-20", type: "deposit" as const, amount: 50000 },
      { date: "2026-01-25", type: "withdrawal" as const, amount: 20000 },
      { date: "2026-02-03", type: "deposit" as const, amount: 70000 },
    ];
    const buckets = byMonth(rows);
    expect(buckets).toHaveLength(2);
    expect(buckets[0]).toMatchObject({ month: "2026-01", deposits: 150000, withdrawals: 20000, net: 130000 });
    expect(buckets[1]).toMatchObject({ month: "2026-02", net: 70000 });
  });
});