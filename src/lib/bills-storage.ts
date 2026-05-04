import type { Bill } from "./types";

const STORAGE_KEY = "ggec_bills";

export function loadBills(): Bill[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Bill[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBills(bills: Bill[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

export function appendBill(bill: Bill): Bill[] {
  const next = [bill, ...loadBills()];
  saveBills(next);
  return next;
}
