import type { Bill, Customer, GameType } from "./types";
import { completedBills } from "./analytics";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function billsForCustomer(bills: Bill[], customerId: string): Bill[] {
  return bills.filter((b) => b.customerId === customerId);
}

export function completedBillsForCustomer(bills: Bill[], customerId: string): Bill[] {
  return completedBills(billsForCustomer(bills, customerId));
}

export type CustomerProfileStats = {
  totalSessions: number;
  totalHours: number;
  totalSpent: number;
  averageSessionHours: number;
  averageSpend: number;
  favoriteStation: { game: GameType; count: number } | null;
  lastSessionAt: string | null;
  sessionsByStation: { game: GameType; count: number; hours: number; spent: number }[];
  recentActivity: { dayIndex: number; label: string; count: number }[];
};

export function computeCustomerProfileStats(
  bills: Bill[],
  customerId: string
): CustomerProfileStats {
  const done = completedBillsForCustomer(bills, customerId);
  const totalSessions = done.length;
  const totalHours = done.reduce((s, b) => s + b.durationHours, 0);
  const totalSpent = done.reduce((s, b) => s + b.amount, 0);

  const stationMap = new Map<GameType, { count: number; hours: number; spent: number }>();
  for (const b of done) {
    const cur = stationMap.get(b.gameType) ?? { count: 0, hours: 0, spent: 0 };
    cur.count += 1;
    cur.hours += b.durationHours;
    cur.spent += b.amount;
    stationMap.set(b.gameType, cur);
  }

  const sessionsByStation = [...stationMap.entries()]
    .map(([game, v]) => ({ game, ...v }))
    .sort((a, b) => b.count - a.count || b.hours - a.hours);

  let favoriteStation: CustomerProfileStats["favoriteStation"] = null;
  if (sessionsByStation.length) {
    favoriteStation = { game: sessionsByStation[0].game, count: sessionsByStation[0].count };
  }

  const byDay = new Array(7).fill(0) as number[];
  for (const b of done) {
    const d = new Date(b.startedAt || b.createdAt);
    if (!Number.isNaN(d.getTime())) byDay[d.getDay()] += 1;
  }
  const recentActivity = byDay
    .map((count, dayIndex) => ({ dayIndex, label: DAYS[dayIndex], count }))
    .sort((a, b) => b.count - a.count);

  const lastSessionAt =
    done.length > 0
      ? done.reduce((latest, b) => {
          const t = b.endedAt ?? b.startedAt;
          return !latest || t > latest ? t : latest;
        }, "" as string)
      : null;

  return {
    totalSessions,
    totalHours,
    totalSpent,
    averageSessionHours: totalSessions ? totalHours / totalSessions : 0,
    averageSpend: totalSessions ? totalSpent / totalSessions : 0,
    favoriteStation,
    lastSessionAt,
    sessionsByStation,
    recentActivity,
  };
}

export function findCustomer(customers: Customer[], id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}
