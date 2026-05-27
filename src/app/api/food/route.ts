import { NextResponse } from "next/server";
import { createFoodItem, listFoodItems } from "@/lib/server-food";

type CreateFoodBody = {
  name?: string;
  price?: number;
};

export async function GET() {
  try {
    const items = await listFoodItems();
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch food items.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateFoodBody;
    if (!body.name?.trim() || body.price == null) {
      return NextResponse.json({ message: "Name and price are required." }, { status: 400 });
    }

    const item = await createFoodItem({
      name: body.name,
      price: Number(body.price),
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create food item.";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ message }, { status });
  }
}
