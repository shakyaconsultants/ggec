import type { GameType } from "./types";

/** Minimum charge for the first hour (or any session under 1 hour). */
export const MIN_SESSION_CHARGE = 100;

/** Standard hourly rate for each completed hour. */
export const HOURLY_RATE = 100;

/** Per-minute rate when a session ends mid-hour (1–45 extra minutes). */
export const EXTENDED_RATE_PER_MINUTE = 2;

/** Mid-hour partial beyond this many minutes counts as another full hour. */
export const EXTENDED_MINUTES_PER_BLOCK = 45;

export const FIRST_HOUR_MINUTES = 60;

export const GAMING_PRICING_SUMMARY =
  "Rs 100 minimum for the first hour, then Rs 100 per full hour. Mid-hour exit: Rs 2/min for up to 45 min (e.g. 1h 40m = Rs 180), or another Rs 100 if over 45 min (e.g. 1h 50m = Rs 200).";

export const GAMING_RATE_LABEL = "Rs 100/hr";

export function ratePerHour(_game?: GameType): number {
  return HOURLY_RATE;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Gaming charge (whole minutes):
 * - Up to 1 hour: Rs 100
 * - Each extra full hour: + Rs 100 (2h = 200, 3h = 300)
 * - Leftover minutes after full hours:
 *   - 1–45 min → Rs 2/min (e.g. 1h 40m → 100 + 40×2 = 180)
 *   - 46–59 min → + Rs 100 (e.g. 1h 50m → 100 + 100 = 200)
 */
export function computeGamingAmount(totalMinutes: number): number {
  const minutes = Math.max(0, Math.floor(totalMinutes));
  if (minutes <= 0) return 0;

  if (minutes <= FIRST_HOUR_MINUTES) {
    return MIN_SESSION_CHARGE;
  }

  let amount = MIN_SESSION_CHARGE;
  const afterFirstHour = minutes - FIRST_HOUR_MINUTES;
  const fullHours = Math.floor(afterFirstHour / 60);
  const partialMinutes = afterFirstHour % 60;

  amount += fullHours * HOURLY_RATE;

  if (partialMinutes > 0) {
    if (partialMinutes <= EXTENDED_MINUTES_PER_BLOCK) {
      amount += partialMinutes * EXTENDED_RATE_PER_MINUTE;
    } else {
      amount += HOURLY_RATE;
    }
  }

  return roundMoney(amount);
}

export function computeAmount(_game: GameType, durationHours: number): number {
  return computeGamingAmount(durationHours * 60);
}

export function elapsedMinutes(startedAt: string, endedAt?: string): number {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.floor((end - start) / (1000 * 60));
}

export function computeSessionGamingAmount(startedAt: string, endedAt: string): number {
  return computeGamingAmount(elapsedMinutes(startedAt, endedAt));
}

export const GAME_LABELS: Record<GameType, string> = {
  ps2: "PlayStation 2",
  ps3: "PlayStation 3",
  ps4: "PlayStation 4",
  ps5: "PlayStation 5",
  system: "PC / System",
};

export function elapsedHours(startedAt: string, endedAt?: string): number {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  const raw = (end - start) / (1000 * 60 * 60);
  return Math.round(raw * 100) / 100;
}

export function formatDuration(hours: number): string {
  const totalMinutes = Math.floor(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatElapsed(startedAt: string, now = Date.now()): string {
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return "—";
  const totalSeconds = Math.max(0, Math.floor((now - start) / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
