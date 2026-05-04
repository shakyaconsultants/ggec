import { NextResponse } from "next/server";
import type { GameType } from "@/lib/types";
import { createBill, listBills } from "@/lib/server-bills";

type CreateBillBody = {
  customerName?: string;
  phone?: string;
  locality?: string;
  gameType?: GameType;
  durationHours?: number;
};

export async function GET() {
  try {
    const bills = await listBills();
    return NextResponse.json({ bills });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch bills.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateBillBody;
    if (!body.customerName || !body.phone || !body.gameType || body.durationHours == null) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const bill = await createBill({
      customerName: body.customerName,
      phone: body.phone,
      locality: body.locality ?? "",
      gameType: body.gameType,
      durationHours: Number(body.durationHours),
    });

    return NextResponse.json({ bill }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create bill.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
