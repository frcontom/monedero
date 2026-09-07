const locale = process.env.NEXT_PUBLIC_LOCALE?.trim() || "es-CO";
const currency = process.env.NEXT_PUBLIC_CURRENCY?.trim() || "COP";

let cached: Intl.NumberFormat | null = null;

function getFormatter(): Intl.NumberFormat {
  if (cached) return cached;
  try {
    cached = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
  } catch {
    cached = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });
  }
  return cached;
}

export function formatMoney(amount: number): string {
  return getFormatter().format(amount);
}

export function parseMoneyInput(input: string): number | null {
  const cleaned = input.replace(/[$.,\s]/g, "");
  if (!/^\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}