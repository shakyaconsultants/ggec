import type { Collection } from "mongodb";
import type { FoodItem } from "@/lib/types";
import { getDb } from "@/lib/mongodb";

type FoodDocument = FoodItem & {
  _id?: unknown;
};

async function foodCollection(): Promise<Collection<FoodDocument>> {
  const db = await getDb();
  return db.collection<FoodDocument>("food_items");
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toFoodItem(row: FoodDocument): FoodItem {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    createdAt: row.createdAt,
  };
}

export async function listFoodItems(): Promise<FoodItem[]> {
  const food = await foodCollection();
  const rows = await food.find({}).sort({ name: 1 }).toArray();
  return rows.map(toFoodItem);
}

export async function getFoodItemById(id: string): Promise<FoodItem | null> {
  const food = await foodCollection();
  const row = await food.findOne({ id });
  return row ? toFoodItem(row) : null;
}

export async function createFoodItem(input: { name: string; price: number }): Promise<FoodItem> {
  const name = input.name.trim();
  const price = Number(input.price);

  if (!name) {
    throw new Error("Food name is required.");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Invalid price.");
  }

  const food = await foodCollection();
  const existing = await food.findOne({ name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") } });
  if (existing) {
    throw new Error("A food item with this name already exists.");
  }

  const item: FoodItem = {
    id: newId(),
    name,
    price: Math.round(price * 100) / 100,
    createdAt: new Date().toISOString(),
  };

  await food.insertOne(item);
  return item;
}

export async function deleteFoodItem(id: string): Promise<void> {
  const food = await foodCollection();
  const result = await food.deleteOne({ id });
  if (result.deletedCount === 0) {
    throw new Error("Food item not found.");
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
