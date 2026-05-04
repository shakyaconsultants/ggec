import { NextResponse } from "next/server";
import { verifyStaffLogin } from "@/lib/server-auth";

type LoginBody = {
  username?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginBody;
    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, message: "Username and password are required." },
        { status: 400 }
      );
    }

    const ok = await verifyStaffLogin(username, password);
    if (!ok) {
      return NextResponse.json(
        { ok: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
