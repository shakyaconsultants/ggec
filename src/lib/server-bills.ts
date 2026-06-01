import type { Collection } from "mongodb";
import type { Bill, BillStatus, GameType, SessionFoodLine } from "@/lib/types";
import { sumFoodTotal } from "@/lib/food";
import { getDb } from "@/lib/mongodb";
import { computeSessionGamingAmount, elapsedHours } from "@/lib/pricing";
import { getCustomerById, incrementCustomerStats } from "@/lib/server-customers";
import { sendSessionInvoiceEmail } from "@/lib/server-email";
import { getFoodItemById } from "@/lib/server-food";

type BillDocument = Bill & {
  _id?: unknown;
};

const GAME_SET = new Set<GameType>(["ps2", "ps3", "ps4", "ps5", "system"]);

async function billsCollection(): Promise<Collection<BillDocument>> {
  const db = await getDb();
  return db.collection<BillDocument>("bills");
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeFoodItems(raw: SessionFoodLine[] | undefined): SessionFoodLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((line) => ({
    foodId: line.foodId ?? "",
    name: line.name ?? "",
    unitPrice: line.unitPrice ?? 0,
    quantity: line.quantity ?? 0,
  }));
}

function normalizeBill(row: BillDocument): Bill {
  const status: BillStatus =
    row.status === "active" || row.status === "completed" ? row.status : "completed";
  const startedAt = row.startedAt ?? row.createdAt;
  const foodItems = normalizeFoodItems(row.foodItems);
  const foodTotal =
    typeof row.foodTotal === "number" ? row.foodTotal : sumFoodTotal(foodItems);
  const legacyAmount = row.amount ?? 0;
  const gamingAmount =
    typeof row.gamingAmount === "number"
      ? row.gamingAmount
      : status === "completed"
        ? Math.max(0, legacyAmount - foodTotal)
        : 0;
  const amount =
    status === "completed"
      ? typeof row.gamingAmount === "number"
        ? gamingAmount + foodTotal
        : legacyAmount
      : 0;

  return {
    id: row.id,
    customerId: row.customerId ?? "",
    customerName: row.customerName,
    phone: row.phone,
    locality: row.locality ?? "",
    gameType: row.gameType,
    status,
    startedAt,
    endedAt: row.endedAt,
    durationHours: row.durationHours ?? 0,
    foodItems,
    gamingAmount,
    foodTotal,
    amount,
    createdAt: row.createdAt,
  };
}

export async function listBills(): Promise<Bill[]> {
  const bills = await billsCollection();
  const rows = await bills.find({}).sort({ startedAt: -1, createdAt: -1 }).toArray();
  return rows.map(normalizeBill);
}

export async function listActiveBills(): Promise<Bill[]> {
  const bills = await listBills();
  return bills.filter((b) => b.status === "active");
}

export async function startSession(input: {
  customerId: string;
  gameType: GameType;
}): Promise<Bill> {
  if (!GAME_SET.has(input.gameType)) {
    throw new Error("Invalid game type.");
  }

  const customer = await getCustomerById(input.customerId);
  if (!customer) {
    throw new Error("Customer not found.");
  }

  const bills = await billsCollection();
  const existing = await bills.findOne({ customerId: input.customerId, status: "active" });
  if (existing) {
    throw new Error(`${customer.name} already has an active session. End it before starting a new one.`);
  }

  const startedAt = new Date().toISOString();
  const bill: Bill = {
    id: newId(),
    customerId: customer.id,
    customerName: customer.name,
    phone: customer.phone,
    locality: customer.locality,
    gameType: input.gameType,
    status: "active",
    startedAt,
    durationHours: 0,
    foodItems: [],
    gamingAmount: 0,
    foodTotal: 0,
    amount: 0,
    createdAt: startedAt,
  };

  await bills.insertOne(bill);
  return bill;
}

export async function addFoodItemsToSession(billId: string, foodIds: string[]): Promise<Bill> {
  const uniqueIds = [...new Set(foodIds.map((id) => id.trim()).filter(Boolean))];
  if (!uniqueIds.length) {
    throw new Error("At least one food item is required.");
  }

  const bills = await billsCollection();
  const row = await bills.findOne({ id: billId });
  if (!row) {
    throw new Error("Session not found.");
  }

  const bill = normalizeBill(row);
  if (bill.status !== "active") {
    throw new Error("Food can only be added to an active session.");
  }

  const foodItems = [...bill.foodItems];

  for (const foodId of uniqueIds) {
    const foodItem = await getFoodItemById(foodId);
    if (!foodItem) {
      throw new Error(`Food item not found: ${foodId}`);
    }

    const existing = foodItems.find((line) => line.foodId === foodId);
    if (existing) {
      existing.quantity += 1;
    } else {
      foodItems.push({
        foodId: foodItem.id,
        name: foodItem.name,
        unitPrice: foodItem.price,
        quantity: 1,
      });
    }
  }

  const foodTotal = sumFoodTotal(foodItems);
  await bills.updateOne({ id: billId }, { $set: { foodItems, foodTotal } });

  return { ...bill, foodItems, foodTotal };
}

export async function addFoodToSession(billId: string, foodId: string): Promise<Bill> {
  return addFoodItemsToSession(billId, [foodId]);
}

export async function endSession(billId: string): Promise<Bill> {
  const bills = await billsCollection();
  const row = await bills.findOne({ id: billId });
  if (!row) {
    throw new Error("Session not found.");
  }

  const bill = normalizeBill(row);
  if (bill.status !== "active") {
    throw new Error("This session is already completed.");
  }

  const endedAt = new Date().toISOString();
  const durationHours = elapsedHours(bill.startedAt, endedAt);
  const gamingAmount = computeSessionGamingAmount(bill.startedAt, endedAt);
  const foodTotal = sumFoodTotal(bill.foodItems);
  const amount = Math.round((gamingAmount + foodTotal) * 100) / 100;

  const completed: Bill = {
    ...bill,
    status: "completed",
    endedAt,
    durationHours,
    gamingAmount,
    foodTotal,
    amount,
  };

  await bills.updateOne(
    { id: billId },
    {
      $set: {
        status: "completed",
        endedAt,
        durationHours,
        gamingAmount,
        foodTotal,
        amount,
      },
    }
  );

  if (bill.customerId) {
    await incrementCustomerStats(bill.customerId, {
      games: 1,
      hours: durationHours,
      spent: amount,
    });

    const customer = await getCustomerById(bill.customerId);
    if (customer?.email) {
      try {
        await sendSessionInvoiceEmail({ bill: completed, email: customer.email });
      } catch (error) {
        console.error("Failed to send session invoice email:", error);
      }
    }
  }

  return completed;
}
