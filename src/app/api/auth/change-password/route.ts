import { NextResponse } from "next/server";
import { changeUserPassword } from "@/lib/server-auth";

type ChangePasswordBody = {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChangePasswordBody;
    if (!body.email?.trim() || !body.currentPassword || !body.newPassword) {
      return NextResponse.json({ message: "All password fields are required." }, { status: 400 });
    }

    await changeUserPassword({
      email: body.email,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to change password.";
    const status = message.includes("incorrect") ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
