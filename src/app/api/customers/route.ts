import { NextResponse } from "next/server";
import { createCustomer, listCustomers } from "@/lib/server-customers";

type CreateCustomerBody = {
  name?: string;
  email?: string;
  phone?: string;
  locality?: string;
  password?: string;
};

export async function GET() {
  try {
    const customers = await listCustomers();
    return NextResponse.json({ customers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch customers.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateCustomerBody;
    if (!body.name?.trim() || !body.phone?.trim() || !body.email?.trim()) {
      return NextResponse.json({ message: "Name, email, and phone are required." }, { status: 400 });
    }

    const customer = await createCustomer({
      name: body.name,
      email: body.email,
      phone: body.phone,
      locality: body.locality ?? "",
      password: body.password,
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create customer.";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ message }, { status });
  }
}
