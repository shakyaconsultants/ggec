import { NextResponse } from "next/server";
import type { GameType } from "@/lib/types";
import { endSession, listBills, startSession } from "@/lib/server-bills";

type StartSessionBody = {
  customerId?: string;
  gameType?: GameType;
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
    const body = (await req.json()) as StartSessionBody;
    if (!body.customerId || !body.gameType) {
      return NextResponse.json({ message: "Customer and game station are required." }, { status: 400 });
    }

    const bill = await startSession({
      customerId: body.customerId,
      gameType: body.gameType,
    });

    return NextResponse.json({ bill }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start session.";
    const status = message.includes("not found") ? 404 : message.includes("already has") ? 409 : 500;
    return NextResponse.json({ message }, { status });
  }
}
