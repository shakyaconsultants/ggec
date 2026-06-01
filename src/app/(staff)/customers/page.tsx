"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CustomerSearchInput } from "@/components/staff/customer-search";
import { filterCustomers } from "@/lib/customer-search";
import { useApp } from "@/components/providers/app-providers";
import { formatDuration } from "@/lib/pricing";

export default function CustomersPage() {
  const { customers, deleteCustomer } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...customers].sort((a, b) => a.name.localeCompare(b.name)),
    [customers]
  );

  const filtered = useMemo(
    () => filterCustomers(sorted, searchQuery),
    [sorted, searchQuery]
  );

  async function handleDelete(id: string, customerName: string) {
    if (
      !window.confirm(
        `Delete profile for "${customerName}"? All their session history and invoices will be removed.`
      )
    ) {
      return;
    }
    setError(null);
    setSuccess(null);
    setDeletingId(id);
    try {
      await deleteCustomer(id);
      setSuccess(`Deleted profile for ${customerName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete profile.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div>
        <h1 className="font-display" style={{ margin: 0, fontSize: "1.7rem" }}>
          Customer profiles
        </h1>
        <p className="g-muted" style={{ marginTop: "0.35rem", fontSize: "0.92rem" }}>
          Browse player profiles and session stats. New customers are created from{" "}
          <Link href="/create-bill" style={{ color: "#34d399", textDecoration: "none" }}>
            Start session
          </Link>{" "}
          when they are not already in the system.
        </p>
      </div>

      {success ? <p className="g-alert g-alert-success">{success}</p> : null}
      {error ? <p className="g-alert g-alert-error">{error}</p> : null}

      <section>
        <div className="g-customer-list-toolbar">
          <h2 style={{ margin: 0, fontSize: "1rem", color: "#e4e4e7" }}>
            All profiles ({sorted.length})
          </h2>
          {sorted.length > 0 ? (
            <CustomerSearchInput value={searchQuery} onChange={setSearchQuery} />
          ) : null}
        </div>
        {!sorted.length ? (
          <div className="g-card" style={{ padding: "2rem", textAlign: "center", color: "#a1a1aa" }}>
            No profiles yet.{" "}
            <Link href="/create-bill" style={{ color: "#34d399", textDecoration: "none" }}>
              Start a session
            </Link>{" "}
            to create the first customer.
          </div>
        ) : !filtered.length ? (
          <div className="g-card" style={{ padding: "2rem", textAlign: "center", color: "#a1a1aa" }}>
            No profiles match &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          <div className="g-kpi-grid">
            {filtered.map((c) => (
              <div key={c.id} className="g-card g-customer-card" style={{ padding: "0.95rem" }}>
                <div className="g-list-item-top">
                  <Link href={`/customers/${c.id}`} style={{ textDecoration: "none", minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, color: "#fafafa" }}>{c.name}</p>
                    <p className="g-muted" style={{ margin: "0.25rem 0 0", fontSize: "0.82rem" }}>
                      {c.email ? `${c.email} · ` : ""}
                      {c.phone}
                      {c.locality ? ` · ${c.locality}` : ""}
                    </p>
                  </Link>
                  <button
                    type="button"
                    className="g-btn-danger"
                    disabled={deletingId === c.id}
                    onClick={() => handleDelete(c.id, c.name)}
                  >
                    {deletingId === c.id ? "…" : "Delete"}
                  </button>
                </div>
                <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.35rem", fontSize: "0.84rem" }}>
                  <StatRow label="Games played" value={String(c.totalGamesPlayed)} />
                  <StatRow label="Hours played" value={formatDuration(c.totalHoursPlayed)} />
                  <StatRow
                    label="Total spent"
                    value={`Rs ${c.totalSpent.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                  />
                </div>
                <Link href={`/customers/${c.id}`} className="g-customer-card-link">
                  View full profile →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
      <span className="g-muted">{label}</span>
      <span style={{ color: "#e4e4e7", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
