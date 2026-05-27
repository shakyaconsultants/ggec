"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/app-providers";
import { ActiveSessionsPanel } from "@/components/staff/active-sessions";
import { InvoiceModal } from "@/components/staff/session-invoice";
import type { Bill } from "@/lib/types";

export default function ActiveSessionsPage() {
  const { activeSessions, menuItems, endSession, addFoodToSession } = useApp();
  const [endingId, setEndingId] = useState<string | null>(null);
  const [addingFoodBillId, setAddingFoodBillId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invoiceBill, setInvoiceBill] = useState<Bill | null>(null);

  async function handleAddFood(billId: string, foodIds: string[]) {
    setAddingFoodBillId(billId);
    try {
      await addFoodToSession(billId, foodIds);
    } finally {
      setAddingFoodBillId(null);
    }
  }

  async function handleEnd(billId: string) {
    setError(null);
    setInvoiceBill(null);
    setEndingId(billId);
    try {
      const bill = await endSession(billId);
      setInvoiceBill(bill);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to end session.");
    } finally {
      setEndingId(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div>
        <h1 className="font-display" style={{ margin: 0, fontSize: "1.7rem" }}>
          Active sessions
        </h1>
        <p className="g-muted" style={{ marginTop: "0.35rem", fontSize: "0.92rem" }}>
          Manage live gaming sessions — track timers, add food, and end sessions to bill customers.
        </p>
      </div>

      <ActiveSessionsPanel
        sessions={activeSessions}
        menuItems={menuItems}
        onAddFood={handleAddFood}
        onEnd={handleEnd}
        endingId={endingId}
        addingFoodBillId={addingFoodBillId}
      />

      {error ? (
        <p style={{ margin: 0, borderRadius: 12, border: "1px solid #7f1d1d", background: "#450a0a", color: "#fecaca", padding: "0.7rem 0.85rem", fontSize: "0.9rem" }}>
          {error}
        </p>
      ) : null}

      {invoiceBill ? <InvoiceModal bill={invoiceBill} onClose={() => setInvoiceBill(null)} /> : null}
    </div>
  );
}
