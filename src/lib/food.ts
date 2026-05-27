import type { SessionFoodLine } from "./types";

export function sumFoodTotal(items: SessionFoodLine[]): number {
  const raw = items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  return Math.round(raw * 100) / 100;
}

export function lineTotal(line: SessionFoodLine): number {
  return Math.round(line.unitPrice * line.quantity * 100) / 100;
}

export function formatFoodPrice(price: number): string {
  return `Rs ${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function foodOptionLabel(name: string, price: number): string {
  return `${name} — ${formatFoodPrice(price)}`;
}
