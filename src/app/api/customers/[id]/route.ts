import { NextResponse } from "next/server";
import { deleteCustomer } from "@/lib/server-customers";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await deleteCustomer(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete customer.";
    const status =
      message.includes("not found") ? 404 : message.includes("active session") ? 409 : 500;
    return NextResponse.json({ message }, { status });
  }
}
