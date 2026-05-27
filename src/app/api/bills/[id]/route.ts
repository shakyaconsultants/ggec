import { NextResponse } from "next/server";
import { endSession } from "@/lib/server-bills";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const bill = await endSession(id);
    return NextResponse.json({ bill });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to end session.";
    const status =
      message.includes("not found") ? 404 : message.includes("already completed") ? 409 : 500;
    return NextResponse.json({ message }, { status });
  }
}
