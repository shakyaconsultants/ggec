import { NextResponse } from "next/server";
import { deleteCatalogItem } from "@/lib/server-catalog";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteCatalogItem(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete catalog item.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ message }, { status });
  }
}
