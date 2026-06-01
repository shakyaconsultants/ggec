import type { Collection } from "mongodb";
import type { CatalogItem, CatalogItemKind } from "@/lib/types";
import { getDb } from "@/lib/mongodb";

type CatalogDocument = CatalogItem & {
  _id?: unknown;
};

const KIND_SET = new Set<CatalogItemKind>(["gaming_station", "tech_service"]);

async function catalogCollection(): Promise<Collection<CatalogDocument>> {
  const db = await getDb();
  return db.collection<CatalogDocument>("catalog_items");
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toCatalogItem(row: CatalogDocument): CatalogItem {
  return {
    id: row.id,
    name: row.name,
    price: row.price ?? 0,
    kind: row.kind === "tech_service" ? "tech_service" : "gaming_station",
    specs: row.specs ?? "",
    createdAt: row.createdAt,
  };
}

export async function listCatalogItems(kind?: CatalogItemKind): Promise<CatalogItem[]> {
  const catalog = await catalogCollection();
  const filter = kind ? { kind } : {};
  const rows = await catalog.find(filter).sort({ kind: 1, name: 1 }).toArray();
  return rows.map(toCatalogItem);
}

export async function getCatalogItemById(id: string): Promise<CatalogItem | null> {
  const catalog = await catalogCollection();
  const row = await catalog.findOne({ id });
  return row ? toCatalogItem(row) : null;
}

export async function createCatalogItem(input: {
  name: string;
  price?: number;
  kind: CatalogItemKind;
  specs?: string;
}): Promise<CatalogItem> {
  const name = input.name.trim();
  const specs = input.specs?.trim() ?? "";
  const kind = input.kind;

  if (!KIND_SET.has(kind)) {
    throw new Error("Invalid catalog item type.");
  }
  if (!name) {
    throw new Error("Name is required.");
  }

  let price = 0;
  if (kind === "tech_service") {
    price = Number(input.price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("Price is required for extra items.");
    }
    price = Math.round(price * 100) / 100;
  }

  const catalog = await catalogCollection();
  const existing = await catalog.findOne({
    kind,
    name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
  });
  if (existing) {
    throw new Error("An item with this name already exists in this category.");
  }

  const item: CatalogItem = {
    id: newId(),
    name,
    price,
    kind,
    specs,
    createdAt: new Date().toISOString(),
  };

  await catalog.insertOne(item);
  return item;
}

export async function deleteCatalogItem(id: string): Promise<void> {
  const catalog = await catalogCollection();
  const result = await catalog.deleteOne({ id });
  if (result.deletedCount === 0) {
    throw new Error("Catalog item not found.");
  }
}
