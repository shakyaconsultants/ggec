import type { GameType } from "./types";

/** Flat rate for all stations (Rs per hour) */
export const HOURLY_RATE = 100;

export function ratePerHour(_game?: GameType): number {
  return HOURLY_RATE;
}

export function computeAmount(_game: GameType, durationHours: number): number {
  const hours = Math.max(0, durationHours);
  const raw = HOURLY_RATE * hours;
  return Math.round(raw * 100) / 100;
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
