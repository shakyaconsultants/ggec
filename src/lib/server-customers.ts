import type { Collection } from "mongodb";
import type { Customer } from "@/lib/types";
import { env } from "@/lib/env";
import { getDb } from "@/lib/mongodb";
import { createUserAccount, deleteUserByCustomerId } from "@/lib/server-auth";
import { sendWelcomeEmail } from "@/lib/server-email";

type CustomerDocument = Customer & {
  _id?: unknown;
};

async function customersCollection(): Promise<Collection<CustomerDocument>> {
  const db = await getDb();
  return db.collection<CustomerDocument>("customers");
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toCustomer(row: CustomerDocument): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone,
    locality: row.locality,
    totalGamesPlayed: row.totalGamesPlayed ?? 0,
    totalHoursPlayed: row.totalHoursPlayed ?? 0,
    totalSpent: row.totalSpent ?? 0,
    createdAt: row.createdAt,
  };
}

export async function listCustomers(): Promise<Customer[]> {
  const customers = await customersCollection();
  const rows = await customers.find({}).sort({ name: 1 }).toArray();
  return rows.map(toCustomer);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const customers = await customersCollection();
  const row = await customers.findOne({ id });
  return row ? toCustomer(row) : null;
}

export async function createCustomer(input: {
  name: string;
  email: string;
  phone: string;
  locality: string;
  password?: string;
}): Promise<Customer> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const locality = input.locality.trim();
  const password = input.password?.trim() || env.defaultUserPassword();

  if (!name || !phone || !email) {
    throw new Error("Name, email, and phone are required.");
  }

  const customers = await customersCollection();
  const existingPhone = await customers.findOne({ phone });
  if (existingPhone) {
    throw new Error("A customer with this phone number already exists.");
  }

  const customer: Customer = {
    id: newId(),
    name,
    email,
    phone,
    locality,
    totalGamesPlayed: 0,
    totalHoursPlayed: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
  };

  await customers.insertOne(customer);

  try {
    await createUserAccount({
      email,
      password,
      role: "user",
      customerId: customer.id,
    });
  } catch (error) {
    await customers.deleteOne({ id: customer.id });
    throw error;
  }

  try {
    await sendWelcomeEmail({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      locality: customer.locality,
      password,
    });
  } catch (error) {
    await deleteUserByCustomerId(customer.id);
    await customers.deleteOne({ id: customer.id });
    const message = error instanceof Error ? error.message : "Failed to send welcome email.";
    throw new Error(`Profile could not be created: ${message}`);
  }

  return customer;
}

export async function incrementCustomerStats(
  customerId: string,
  delta: { games: number; hours: number; spent: number }
): Promise<void> {
  const customers = await customersCollection();
  await customers.updateOne(
    { id: customerId },
    {
      $inc: {
        totalGamesPlayed: delta.games,
        totalHoursPlayed: delta.hours,
        totalSpent: delta.spent,
      },
    }
  );
}

export async function deleteCustomer(id: string): Promise<void> {
  const customers = await customersCollection();
  const customer = await customers.findOne({ id });
  if (!customer) {
    throw new Error("Customer not found.");
  }

  const db = await getDb();
  const active = await db.collection("bills").findOne({ customerId: id, status: "active" });
  if (active) {
    throw new Error("End the active session before deleting this profile.");
  }

  await db.collection("bills").deleteMany({ customerId: id });
  await deleteUserByCustomerId(id);
  const result = await customers.deleteOne({ id });
  if (result.deletedCount === 0) {
    throw new Error("Customer not found.");
  }
}
