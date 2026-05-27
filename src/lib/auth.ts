import type { UserRole } from "./types";
import { getPublicDefaultUserPassword } from "./env";

export const SESSION_KEY = "ggec_auth";

/** Client-side default for the admin create-profile password field. Set via NEXT_PUBLIC_DEFAULT_USER_PASSWORD. */
export const DEFAULT_USER_PASSWORD = getPublicDefaultUserPassword();

export type AuthSession = {
  id: string;
  email: string;
  role: UserRole;
  customerId?: string;
};

export function parseAuthSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  if (raw === "1") {
    return { id: "legacy-admin", email: "", role: "admin" };
  }
  try {
    const data = JSON.parse(raw) as AuthSession;
    if (!data?.id || !data?.role) return null;
    if (data.role !== "admin" && data.role !== "user") return null;
    return data;
  } catch {
    return null;
  }
}

export function isAdmin(session: AuthSession | null): boolean {
  return session?.role === "admin";
}

export function isUser(session: AuthSession | null): boolean {
  return session?.role === "user";
}
