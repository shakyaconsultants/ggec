import { NextResponse } from "next/server";
import type { CatalogItemKind } from "@/lib/types";
import { createCatalogItem, listCatalogItems } from "@/lib/server-catalog";

type CreateCatalogBody = {
  name?: string;
  price?: number;
  kind?: CatalogItemKind;
  specs?: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get("kind") as CatalogItemKind | null;
    const items = await listCatalogItems(
      kind === "gaming_station" || kind === "tech_service" ? kind : undefined
    );
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch catalog items.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateCatalogBody;
    if (!body.name?.trim() || !body.kind) {
      return NextResponse.json({ message: "Name and type are required." }, { status: 400 });
    }
    if (body.kind === "tech_service" && body.price == null) {
      return NextResponse.json({ message: "Price is required for extra items." }, { status: 400 });
    }

    const item = await createCatalogItem({
      name: body.name,
      price: body.price == null ? undefined : Number(body.price),
      kind: body.kind,
      specs: body.specs,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create catalog item.";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ message }, { status });
  }
}
