"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Bill, GameType } from "@/lib/types";

const SESSION_KEY = "ggec_staff_session";

type AppContextValue = {
  bills: Bill[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addBill: (input: {
    customerName: string;
    phone: string;
    locality: string;
    gameType: GameType;
    durationHours: number;
  }) => Promise<Bill>;
  refreshBills: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);

  const refreshBills = useCallback(async () => {
    const res = await fetch("/api/bills", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Unable to load bills from database.");
    }
    const data = (await res.json()) as { bills?: Bill[] };
    setBills(Array.isArray(data.bills) ? data.bills : []);
  }, []);

  useEffect(() => {
    setAuthenticated(localStorage.getItem(SESSION_KEY) === "1");
    refreshBills().catch(() => {
      setBills([]);
    }).finally(() => {
      setHydrated(true);
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const ok = res.ok;
    if (ok) {
      localStorage.setItem(SESSION_KEY, "1");
      setAuthenticated(true);
      await refreshBills().catch(() => {});
    }
    return ok;
  }, [refreshBills]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
  }, []);

  const addBill = useCallback(
    async (input: {
      customerName: string;
      phone: string;
      locality: string;
      gameType: GameType;
      durationHours: number;
    }) => {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        let message = "Unable to save bill.";
        try {
          const data = (await res.json()) as { message?: string };
          if (data.message) message = data.message;
        } catch {}
        throw new Error(message);
      }
      const data = (await res.json()) as { bill?: Bill };
      const bill = data.bill;
      if (!bill) {
        throw new Error("Invalid response while saving bill.");
      }
      setBills((prev) => [bill, ...prev]);
      return bill;
    }, []
  );

  const value = useMemo(
    () => ({
      bills,
      isAuthenticated,
      login,
      logout,
      addBill,
      refreshBills,
    }),
    [bills, isAuthenticated, login, logout, addBill, refreshBills]
  );

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400 text-sm">
        Loading…
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProviders");
  return ctx;
}
