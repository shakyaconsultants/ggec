"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type AuthSession,
  SESSION_KEY,
  isAdmin as checkIsAdmin,
  isUser as checkIsUser,
  parseAuthSession,
} from "@/lib/auth";
import type { Bill, Customer, FoodItem, GameType } from "@/lib/types";
import { activeBills as filterActiveBills } from "@/lib/analytics";

type AppContextValue = {
  bills: Bill[];
  activeSessions: Bill[];
  customers: Customer[];
  menuItems: FoodItem[];
  authUser: AuthSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  login: (username: string, password: string) => Promise<AuthSession | null>;
  logout: () => void;
  changePassword: (input: {
    email: string;
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  addCustomer: (input: {
    name: string;
    email: string;
    phone: string;
    locality: string;
    password?: string;
  }) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  addMenuItem: (input: { name: string; price: number }) => Promise<FoodItem>;
  deleteMenuItem: (id: string) => Promise<void>;
  startSession: (input: { customerId: string; gameType: GameType }) => Promise<Bill>;
  endSession: (billId: string) => Promise<Bill>;
  addFoodToSession: (billId: string, foodIds: string | string[]) => Promise<Bill>;
  refreshBills: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  refreshMenuItems: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function persistSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.removeItem("ggec_staff_session");
  } else {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("ggec_staff_session");
  }
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [authUser, setAuthUser] = useState<AuthSession | null>(null);

  const refreshBills = useCallback(async () => {
    const res = await fetch("/api/bills", { cache: "no-store" });
    if (!res.ok) throw new Error("Unable to load bills from database.");
    const data = (await res.json()) as { bills?: Bill[] };
    setBills(Array.isArray(data.bills) ? data.bills : []);
  }, []);

  const refreshCustomers = useCallback(async () => {
    const res = await fetch("/api/customers", { cache: "no-store" });
    if (!res.ok) throw new Error("Unable to load customers from database.");
    const data = (await res.json()) as { customers?: Customer[] };
    setCustomers(Array.isArray(data.customers) ? data.customers : []);
  }, []);

  const refreshMenuItems = useCallback(async () => {
    const res = await fetch("/api/food", { cache: "no-store" });
    if (!res.ok) throw new Error("Unable to load food menu from database.");
    const data = (await res.json()) as { items?: FoodItem[] };
    setMenuItems(Array.isArray(data.items) ? data.items : []);
  }, []);

  useEffect(() => {
    const legacy = localStorage.getItem("ggec_staff_session");
    const raw = localStorage.getItem(SESSION_KEY) ?? (legacy === "1" ? "1" : null);
    setAuthUser(parseAuthSession(raw));
    Promise.all([refreshBills(), refreshCustomers(), refreshMenuItems()])
      .catch(() => {
        setBills([]);
        setCustomers([]);
        setMenuItems([]);
      })
      .finally(() => setHydrated(true));
  }, [refreshBills, refreshCustomers, refreshMenuItems]);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { user?: AuthSession };
      if (!data.user) return null;
      persistSession(data.user);
      setAuthUser(data.user);
      await Promise.all([refreshBills(), refreshCustomers(), refreshMenuItems()]).catch(() => {});
      return data.user;
    },
    [refreshBills, refreshCustomers, refreshMenuItems]
  );

  const logout = useCallback(() => {
    persistSession(null);
    setAuthUser(null);
  }, []);

  const changePassword = useCallback(
    async (input: { email: string; currentPassword: string; newPassword: string }) => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        let message = "Unable to change password.";
        try {
          const data = (await res.json()) as { message?: string };
          if (data.message) message = data.message;
        } catch {}
        throw new Error(message);
      }
    },
    []
  );

  const addCustomer = useCallback(
    async (input: {
      name: string;
      email: string;
      phone: string;
      locality: string;
      password?: string;
    }) => {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        let message = "Unable to create customer.";
        try {
          const data = (await res.json()) as { message?: string };
          if (data.message) message = data.message;
        } catch {}
        throw new Error(message);
      }
      const data = (await res.json()) as { customer?: Customer };
      const customer = data.customer;
      if (!customer) throw new Error("Invalid response while creating customer.");
      setCustomers((prev) => {
        if (prev.some((c) => c.id === customer.id)) {
          return prev.map((c) => (c.id === customer.id ? customer : c));
        }
        return [...prev, customer].sort((a, b) => a.name.localeCompare(b.name));
      });
      return customer;
    },
    []
  );

  const deleteCustomer = useCallback(async (id: string) => {
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      let message = "Unable to delete customer.";
      try {
        const data = (await res.json()) as { message?: string };
        if (data.message) message = data.message;
      } catch {}
      throw new Error(message);
    }
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setBills((prev) => prev.filter((b) => b.customerId !== id));
  }, []);

  const addMenuItem = useCallback(async (input: { name: string; price: number }) => {
    const res = await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      let message = "Unable to create food item.";
      try {
        const data = (await res.json()) as { message?: string };
        if (data.message) message = data.message;
      } catch {}
      throw new Error(message);
    }
    const data = (await res.json()) as { item?: FoodItem };
    const item = data.item;
    if (!item) throw new Error("Invalid response while creating food item.");
    setMenuItems((prev) => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
    return item;
  }, []);

  const deleteMenuItem = useCallback(async (id: string) => {
    const res = await fetch(`/api/food/${id}`, { method: "DELETE" });
    if (!res.ok) {
      let message = "Unable to delete food item.";
      try {
        const data = (await res.json()) as { message?: string };
        if (data.message) message = data.message;
      } catch {}
      throw new Error(message);
    }
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const startSession = useCallback(async (input: { customerId: string; gameType: GameType }) => {
    const res = await fetch("/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      let message = "Unable to start session.";
      try {
        const data = (await res.json()) as { message?: string };
        if (data.message) message = data.message;
      } catch {}
      throw new Error(message);
    }
    const data = (await res.json()) as { bill?: Bill };
    const bill = data.bill;
    if (!bill) throw new Error("Invalid response while starting session.");
    setBills((prev) => [bill, ...prev]);
    return bill;
  }, []);

  const addFoodToSession = useCallback(async (billId: string, foodIds: string | string[]) => {
    const ids = Array.isArray(foodIds) ? foodIds : [foodIds];
    const res = await fetch(`/api/bills/${billId}/food`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodIds: ids }),
    });
    if (!res.ok) {
      let message = "Unable to add food to session.";
      try {
        const data = (await res.json()) as { message?: string };
        if (data.message) message = data.message;
      } catch {}
      throw new Error(message);
    }
    const data = (await res.json()) as { bill?: Bill };
    const bill = data.bill;
    if (!bill) throw new Error("Invalid response while adding food.");
    setBills((prev) => prev.map((b) => (b.id === billId ? bill : b)));
    return bill;
  }, []);

  const endSession = useCallback(async (billId: string) => {
    const res = await fetch(`/api/bills/${billId}`, { method: "PATCH" });
    if (!res.ok) {
      let message = "Unable to end session.";
      try {
        const data = (await res.json()) as { message?: string };
        if (data.message) message = data.message;
      } catch {}
      throw new Error(message);
    }
    const data = (await res.json()) as { bill?: Bill };
    const bill = data.bill;
    if (!bill) throw new Error("Invalid response while ending session.");
    setBills((prev) => prev.map((b) => (b.id === billId ? bill : b)));
    await refreshCustomers().catch(() => {});
    return bill;
  }, [refreshCustomers]);

  const activeSessions = useMemo(() => filterActiveBills(bills), [bills]);
  const isAuthenticated = authUser !== null;
  const isAdmin = checkIsAdmin(authUser);
  const isUser = checkIsUser(authUser);

  const value = useMemo(
    () => ({
      bills,
      activeSessions,
      customers,
      menuItems,
      authUser,
      isAuthenticated,
      isAdmin,
      isUser,
      login,
      logout,
      changePassword,
      addCustomer,
      deleteCustomer,
      addMenuItem,
      deleteMenuItem,
      startSession,
      endSession,
      addFoodToSession,
      refreshBills,
      refreshCustomers,
      refreshMenuItems,
    }),
    [
      bills,
      activeSessions,
      customers,
      menuItems,
      authUser,
      isAuthenticated,
      isAdmin,
      isUser,
      login,
      logout,
      changePassword,
      addCustomer,
      deleteCustomer,
      addMenuItem,
      deleteMenuItem,
      startSession,
      endSession,
      addFoodToSession,
      refreshBills,
      refreshCustomers,
      refreshMenuItems,
    ]
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
