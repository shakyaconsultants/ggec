import bcrypt from "bcryptjs";
import type { Collection } from "mongodb";
import type { AuthSession } from "@/lib/auth";
import { env } from "@/lib/env";
import type { UserAccount, UserRole } from "@/lib/types";
import { getDb } from "@/lib/mongodb";

type UserDocument = UserAccount & {
  passwordHash: string;
};

function usersCollection(): Promise<Collection<UserDocument>> {
  return getDb().then((db) => db.collection<UserDocument>("users"));
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function toPublicUser(row: UserDocument): UserAccount {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    customerId: row.customerId,
    createdAt: row.createdAt,
  };
}

export async function ensureSeedAdminUser() {
  const email = normalizeEmail(env.seedStaffEmail());
  const password = env.seedStaffPassword();
  const users = await usersCollection();

  const existing = await users.findOne({ email });
  if (existing) {
    if (!existing.role) {
      await users.updateOne({ id: existing.id }, { $set: { role: "admin" as UserRole } });
    }
    return;
  }

  const legacy = await getDb().then((db) => db.collection("staff_users").findOne({ email }));
  if (legacy && "passwordHash" in legacy) {
    await users.insertOne({
      id: newId(),
      email,
      passwordHash: legacy.passwordHash as string,
      role: "admin",
      createdAt: new Date().toISOString(),
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await users.insertOne({
    id: newId(),
    email,
    passwordHash,
    role: "admin",
    createdAt: new Date().toISOString(),
  });
}

export async function verifyLogin(email: string, password: string): Promise<AuthSession | null> {
  await ensureSeedAdminUser();
  const normalized = normalizeEmail(email);
  const users = await usersCollection();
  const user = await users.findOne({ email: normalized });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role === "user" ? "user" : "admin",
    customerId: user.customerId,
  };
}

export async function createUserAccount(input: {
  email: string;
  password: string;
  role: UserRole;
  customerId?: string;
}): Promise<UserAccount> {
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!email) throw new Error("Email is required.");
  if (!password || password.length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }
  if (input.role === "user" && !input.customerId) {
    throw new Error("Customer link is required for user accounts.");
  }

  const users = await usersCollection();
  const existing = await users.findOne({ email });
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: UserDocument = {
    id: newId(),
    email,
    passwordHash,
    role: input.role,
    customerId: input.customerId,
    createdAt: new Date().toISOString(),
  };

  await users.insertOne(user);
  return toPublicUser(user);
}

export async function changeUserPassword(input: {
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const email = normalizeEmail(input.email);
  const users = await usersCollection();
  const user = await users.findOne({ email });
  if (!user) throw new Error("Account not found.");

  const currentOk = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!currentOk) throw new Error("Current password is incorrect.");

  if (!input.newPassword || input.newPassword.length < 4) {
    throw new Error("New password must be at least 4 characters.");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);
  await users.updateOne({ id: user.id }, { $set: { passwordHash } });
}

export async function deleteUserByCustomerId(customerId: string): Promise<void> {
  const users = await usersCollection();
  await users.deleteMany({ customerId });
}

export async function getUserByCustomerId(customerId: string): Promise<UserAccount | null> {
  const users = await usersCollection();
  const row = await users.findOne({ customerId });
  return row ? toPublicUser(row) : null;
}
