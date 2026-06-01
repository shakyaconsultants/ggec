export type GameType = "ps2" | "ps3" | "ps4" | "ps5" | "system";

export type BillStatus = "active" | "completed";

export type UserRole = "admin" | "user";

export type CatalogItemKind = "gaming_station" | "tech_service";

export type CatalogItem = {
  id: string;
  name: string;
  price: number;
  kind: CatalogItemKind;
  specs: string;
  createdAt: string;
};

export type FoodItem = {
  id: string;
  name: string;
  price: number;
  createdAt: string;
};

export type SessionFoodLine = {
  foodId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type SessionTechLine = {
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type UserAccount = {
  id: string;
  email: string;
  role: UserRole;
  customerId?: string;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  locality: string;
  totalGamesPlayed: number;
  totalHoursPlayed: number;
  totalSpent: number;
  createdAt: string;
};

export type Bill = {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  locality: string;
  /** @deprecated Legacy station slug; use stationId/stationName for new sessions. */
  gameType?: GameType;
  stationId: string;
  stationName: string;
  extraSpecs: string;
  status: BillStatus;
  startedAt: string;
  endedAt?: string;
  durationHours: number;
  foodItems: SessionFoodLine[];
  techItems: SessionTechLine[];
  gamingAmount: number;
  foodTotal: number;
  techTotal: number;
  amount: number;
  createdAt: string;
};
