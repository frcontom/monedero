const currency = process.env.NEXT_PUBLIC_CURRENCY ?? "COP";
const locale = process.env.NEXT_PUBLIC_LOCALE ?? "es-CO";

const formatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  maximumFractionDigits: 0,
});

export function formatMoney(amount: number): string {
  return formatter.format(amount);
}

export function parseMoneyInput(input: string): number | null {
  const cleaned = input.replace(/[$.,\s]/g, "");
  if (!/^\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}