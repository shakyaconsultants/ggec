import { NextResponse } from "next/server";
import { addFoodItemsToSession } from "@/lib/server-bills";

type Params = { params: Promise<{ id: string }> };

type AddFoodBody = {
  foodId?: string;
  foodIds?: string[];
};

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as AddFoodBody;
    const foodIds = Array.isArray(body.foodIds)
      ? body.foodIds
      : body.foodId
        ? [body.foodId]
        : [];

    if (!foodIds.length) {
      return NextResponse.json({ message: "At least one food item is required." }, { status: 400 });
    }

    const bill = await addFoodItemsToSession(id, foodIds);
    return NextResponse.json({ bill });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add food to session.";
    const status =
      message.includes("not found") ? 404 : message.includes("active session") ? 409 : 500;
    return NextResponse.json({ message }, { status });
  }
}
