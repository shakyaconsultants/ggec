"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useApp } from "@/components/providers/app-providers";
import { CustomerProfileView } from "@/components/customer/customer-profile-view";
import { findCustomer } from "@/lib/customer-analytics";

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const { customers, bills, deleteCustomer } = useApp();

  const customer = useMemo(() => findCustomer(customers, id), [customers, id]);

  if (!customer) {
    return (
      <div className="g-card" style={{ padding: "2rem", textAlign: "center" }}>
        <p className="g-muted" style={{ margin: 0 }}>Customer not found.</p>
        <Link href="/customers" className="g-btn-primary" style={{ marginTop: "1rem", display: "inline-flex" }}>
          Back to customers
        </Link>
      </div>
    );
  }

  return (
    <CustomerProfileView
      customer={customer}
      bills={bills}
      backLink={{ href: "/customers", label: "← All customers" }}
      showDelete
      onDelete={async () => {
        await deleteCustomer(customer.id);
        router.push("/customers");
      }}
    />
  );
}
