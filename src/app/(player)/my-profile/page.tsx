"use client";

import { useMemo } from "react";
import { useApp } from "@/components/providers/app-providers";
import { CustomerProfileView } from "@/components/customer/customer-profile-view";
import { findCustomer } from "@/lib/customer-analytics";

export default function MyProfilePage() {
  const { authUser, customers, bills } = useApp();

  const customer = useMemo(() => {
    if (!authUser?.customerId) return undefined;
    return findCustomer(customers, authUser.customerId);
  }, [customers, authUser?.customerId]);

  if (!customer) {
    return (
      <div className="g-card" style={{ padding: "2rem", textAlign: "center", color: "#a1a1aa" }}>
        Your player profile is not linked yet. Contact the center admin.
      </div>
    );
  }

  return (
    <CustomerProfileView
      customer={customer}
      bills={bills}
      showPasswordForm
      passwordEmail={authUser?.email ?? customer.email}
    />
  );
}
