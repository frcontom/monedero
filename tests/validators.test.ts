import { describe, expect, it } from "vitest";
import { goalSchema, movementSchema } from "@/lib/validators/goal";

const validPeriodic = {
  name: "PC gamer",
  targetAmount: 5000000,
  startDate: "2026-09-01",
  dateMode: "TARGET_DATE",
  targetDate: "2026-12-31",
  planningMode: "PERIODIC",
  periodicity: "MONTHLY",
  plannedAmount: 1500000,
  category: "COMPRA",
};

describe("goalSchema", () => {
  it("acepta una meta periódica con fecha válida", () => {
    const res = goalSchema.safeParse(validPeriodic);
    expect(res.success).toBe(true);
  });

  it("acepta una meta sin fecha y flexible", () => {
    const res = goalSchema.safeParse({
      name: "Fondo libre",
      targetAmount: 1000000,
      startDate: "2026-09-01",
      dateMode: "NO_DATE",
      targetDate: null,
      planningMode: "FLEXIBLE",
      periodicity: null,
      plannedAmount: null,
      category: "FONDO",
    });
    expect(res.success).toBe(true);
  });

  it("rechaza monto objetivo no positivo", () => {
    const res = goalSchema.safeParse({ ...validPeriodic, targetAmount: 0 });
    expect(res.success).toBe(false);
  });

  it("rechaza TARGET_DATE sin fecha objetivo", () => {
    const res = goalSchema.safeParse({ ...validPeriodic, targetDate: null });
    expect(res.success).toBe(false);
    expect(res.success || "").toBeDefined();
  });

  it("rechaza NO_DATE con fecha objetivo", () => {
    const res = goalSchema.safeParse({
      ...validPeriodic,
      dateMode: "NO_DATE",
      targetDate: "2026-12-31",
    });
    expect(res.success).toBe(false);
  });

  it("rechaza PERIODIC sin periodicidad ni monto", () => {
    const res = goalSchema.safeParse({
      ...validPeriodic,
      periodicity: null,
      plannedAmount: null,
    });
    expect(res.success).toBe(false);
  });

  it("rechaza FLEXIBLE con campos periódicos", () => {
    const res = goalSchema.safeParse({
      ...validPeriodic,
      planningMode: "FLEXIBLE",
      periodicity: "MONTHLY",
      plannedAmount: 1500000,
    });
    expect(res.success).toBe(false);
  });

  it("rechaza fecha objetivo anterior al inicio", () => {
    const res = goalSchema.safeParse({
      ...validPeriodic,
      targetDate: "2026-08-01",
      startDate: "2026-09-01",
    });
    expect(res.success).toBe(false);
  });
});

describe("movementSchema", () => {
  it("acepta movimiento válido", () => {
    expect(
      movementSchema.safeParse({ date: "2026-09-10", type: "deposit", amount: 100000 }).success,
    ).toBe(true);
  });

  it("rechaza monto 0 o negativo", () => {
    expect(
      movementSchema.safeParse({ date: "2026-09-10", type: "deposit", amount: 0 }).success,
    ).toBe(false);
    expect(
      movementSchema.safeParse({ date: "2026-09-10", type: "withdrawal", amount: -5 }).success,
    ).toBe(false);
  });

  it("rechaza tipo inválido", () => {
    expect(
      movementSchema.safeParse({ date: "2026-09-10", type: "other", amount: 100 }).success,
    ).toBe(false);
  });
});