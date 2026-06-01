import type { Bill, CatalogItemKind, SessionTechLine } from "./types";
import { GAME_LABELS } from "./pricing";
import type { GameType } from "./types";

export const CATALOG_KIND_LABELS: Record<CatalogItemKind, string> = {
  gaming_station: "Gaming station",
  tech_service: "Extra item",
};

export const EXTRAS_SECTION_LABEL = "Extra items";
export const EXTRAS_SECTION_HINT =
  "Monitors, controllers, consoles, and other add-ons with fixed pricing at session start.";

export function sumTechTotal(items: SessionTechLine[]): number {
  const raw = items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  return Math.round(raw * 100) / 100;
}

export function techLineTotal(line: SessionTechLine): number {
  return Math.round(line.unitPrice * line.quantity * 100) / 100;
}

export function formatCatalogPrice(price: number): string {
  return `Rs ${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function catalogOptionLabel(name: string, price: number, specs?: string): string {
  const base = price > 0 ? `${name} — ${formatCatalogPrice(price)}` : name;
  if (!specs?.trim()) return base;
  return `${base} (${specs.trim()})`;
}

export function getStationLabel(bill: Bill): string {
  if (bill.stationName?.trim()) return bill.stationName.trim();
  if (bill.gameType && GAME_LABELS[bill.gameType as GameType]) {
    return GAME_LABELS[bill.gameType as GameType];
  }
  return "Gaming session";
}

export function getBillStationKey(bill: Bill): string {
  if (bill.stationId) return bill.stationId;
  if (bill.gameType) return bill.gameType;
  return "unknown";
}
