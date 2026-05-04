import type { Collection } from "mongodb";
import type { Bill, GameType } from "@/lib/types";
import { getDb } from "@/lib/mongodb";
import { computeAmount } from "@/lib/pricing";

type BillDocument = Bill & {
  _id?: unknown;
};

const GAME_SET = new Set<GameType>(["ps2", "ps3", "ps4", "ps5", "system"]);

async function billsCollection(): Promise<Collection<BillDocument>> {
  const db = await getDb();
  return db.collection<BillDocument>("bills");
}

export async function listBills(): Promise<Bill[]> {
  const bills = await billsCollection();
  const rows = await bills.find({}).sort({ createdAt: -1 }).toArray();
  return rows.map((row) => ({
    id: row.id,
    customerName: row.customerName,
    phone: row.phone,
    locality: row.locality,
    gameType: row.gameType,
    durationHours: row.durationHours,
    amount: row.amount,
    createdAt: row.createdAt,
  }));
}

export async function createBill(input: {
  customerName: string;
  phone: string;
  locality: string;
  gameType: GameType;
  durationHours: number;
}): Promise<Bill> {
  const customerName = input.customerName.trim();
  const phone = input.phone.trim();
  const locality = input.locality.trim();
  const durationHours = Number(input.durationHours);

  if (!customerName || !phone) {
    throw new Error("Customer name and phone are required.");
  }
  if (!GAME_SET.has(input.gameType)) {
    throw new Error("Invalid game type.");
  }
  if (!Number.isFinite(durationHours) || durationHours < 0) {
    throw new Error("Invalid duration.");
  }

  const bill: Bill = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    customerName,
    phone,
    locality,
    gameType: input.gameType,
    durationHours,
    amount: computeAmount(input.gameType, durationHours),
    createdAt: new Date().toISOString(),
  };

  const bills = await billsCollection();
  await bills.insertOne(bill);
  return bill;
}
