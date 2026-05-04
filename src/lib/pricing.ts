import type { GameType } from "./types";

const RATES: Record<GameType, number> = {
  ps2: 100,
  ps3: 150,
  ps4: 200,
  ps5: 250,
  system: 150,
};

export function ratePerHour(game: GameType): number {
  return RATES[game];
}

export function computeAmount(game: GameType, durationHours: number): number {
  const hours = Math.max(0, durationHours);
  const raw = ratePerHour(game) * hours;
  return Math.round(raw * 100) / 100;
}

export const GAME_LABELS: Record<GameType, string> = {
  ps2: "PlayStation 2",
  ps3: "PlayStation 3",
  ps4: "PlayStation 4",
  ps5: "PlayStation 5",
  system: "PC / System",
};
