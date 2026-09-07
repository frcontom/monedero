import { describe, expect, it } from "vitest";
import { formatMoney, parseMoneyInput } from "@/lib/money";

describe("money", () => {
  it("formatea COP sin decimales", () => {
    expect(formatMoney(10000)).toContain("10.000");
  });

  it("parsea entrada con símbolos y separadores", () => {
    expect(parseMoneyInput("$ 10.000")).toBe(10000);
    expect(parseMoneyInput("1,000,000")).toBe(1000000);
    expect(parseMoneyInput("500000")).toBe(500000);
  });

  it("rechaza entradas no numéricas", () => {
    expect(parseMoneyInput("abc")).toBeNull();
    expect(parseMoneyInput("12.5a6")).toBeNull();
  });
});