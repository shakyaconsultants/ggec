import type { Bill, GameType } from "./types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function completedBills(bills: Bill[]): Bill[] {
  return bills.filter((b) => b.status === "completed");
}

export function activeBills(bills: Bill[]): Bill[] {
  return bills.filter((b) => b.status === "active");
}

function billTime(b: Bill): Date {
  return new Date(b.startedAt || b.createdAt);
}

export function mostPlayedGame(bills: Bill[]): { game: GameType; count: number } | null {
  const done = completedBills(bills);
  if (!done.length) return null;
  const counts = new Map<GameType, number>();
  for (const b of done) {
    counts.set(b.gameType, (counts.get(b.gameType) ?? 0) + 1);
  }
  let best: GameType = done[0].gameType;
  let max = 0;
  for (const [g, n] of counts) {
    if (n > max) {
      max = n;
      best = g;
    }
  }
  return { game: best, count: max };
}

export function peakHours(bills: Bill[]): { hour: number; count: number }[] {
  const byHour = new Array(24).fill(0) as number[];
  for (const b of completedBills(bills)) {
    const d = billTime(b);
    if (!Number.isNaN(d.getTime())) byHour[d.getHours()] += 1;
  }
  const peak = Math.max(...byHour, 0);
  return byHour
    .map((count, hour) => ({ hour, count }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count || a.hour - b.hour)
    .map((x) => ({ ...x, isPeak: x.count === peak && peak > 0 }));
}

export function peakDaysOfWeek(bills: Bill[]): { dayIndex: number; label: string; count: number }[] {
  const byDay = new Array(7).fill(0) as number[];
  for (const b of completedBills(bills)) {
    const d = billTime(b);
    if (!Number.isNaN(d.getTime())) byDay[d.getDay()] += 1;
  }
  const peak = Math.max(...byDay, 0);
  return byDay
    .map((count, dayIndex) => ({ dayIndex, label: DAYS[dayIndex], count }))
    .sort((a, b) => b.count - a.count || a.dayIndex - b.dayIndex)
    .map((x) => ({ ...x, isPeak: x.count === peak && peak > 0 }));
}

function customerKey(name: string, phone: string): string {
  return `${name.trim().toLowerCase()}|||${phone.trim()}`;
}

export function topCustomerByRevenue(bills: Bill[]): {
  name: string;
  phone: string;
  revenue: number;
} | null {
  const done = completedBills(bills);
  if (!done.length) return null;
  const rev = new Map<string, { name: string; phone: string; revenue: number }>();
  for (const b of done) {
    const k = customerKey(b.customerName, b.phone);
    const cur = rev.get(k) ?? { name: b.customerName, phone: b.phone, revenue: 0 };
    cur.revenue += b.amount;
    rev.set(k, cur);
  }
  let best: { name: string; phone: string; revenue: number } | null = null;
  for (const v of rev.values()) {
    if (!best || v.revenue > best.revenue) best = v;
  }
  return best;
}

export function topLocalityByRevenue(bills: Bill[]): { locality: string; revenue: number } | null {
  const done = completedBills(bills);
  if (!done.length) return null;
  const rev = new Map<string, number>();
  for (const b of done) {
    const loc = b.locality.trim() || "—";
    rev.set(loc, (rev.get(loc) ?? 0) + b.amount);
  }
  let best: { locality: string; revenue: number } | null = null;
  for (const [locality, revenue] of rev) {
    if (!best || revenue > best.revenue) best = { locality, revenue };
  }
  return best;
}

export function totalRevenue(bills: Bill[]): number {
  return completedBills(bills).reduce((s, b) => s + b.amount, 0);
}
