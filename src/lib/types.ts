export type GameType = "ps2" | "ps3" | "ps4" | "ps5" | "system";

export type Bill = {
  id: string;
  customerName: string;
  phone: string;
  locality: string;
  gameType: GameType;
  /** Hours played; fractional allowed (e.g. 1.5) */
  durationHours: number;
  amount: number;
  createdAt: string;
};
