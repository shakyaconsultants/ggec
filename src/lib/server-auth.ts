import bcrypt from "bcryptjs";
import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";

type StaffUser = {
  email: string;
  passwordHash: string;
  createdAt: string;
};

function usersCollection(dbName?: string): Promise<Collection<StaffUser>> {
  return getDb(dbName).then((db) => db.collection<StaffUser>("staff_users"));
}

export async function ensureSeedStaffUser() {
  const email = (process.env.SEED_STAFF_EMAIL ?? "ggec@gmail.com").toLowerCase().trim();
  const password = process.env.SEED_STAFF_PASSWORD ?? "Anubhav@123";
  const users = await usersCollection();
  const existing = await users.findOne({ email });
  if (existing) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await users.insertOne({
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  });
}

export async function verifyStaffLogin(email: string, password: string): Promise<boolean> {
  await ensureSeedStaffUser();
  const normalized = email.toLowerCase().trim();
  const users = await usersCollection();
  const user = await users.findOne({ email: normalized });
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}
