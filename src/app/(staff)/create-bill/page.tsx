"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/app-providers";
import { CustomerSelectDropdown } from "@/components/staff/customer-search";
import type { GameType } from "@/lib/types";
import { GAME_LABELS } from "@/lib/pricing";

const inputClass = "g-input";
const GAMES: GameType[] = ["ps2", "ps3", "ps4", "ps5", "system"];

export default function CreateBillPage() {
  const { customers, activeSessions, startSession } = useApp();
  const [customerId, setCustomerId] = useState("");
  const [gameType, setGameType] = useState<GameType>("ps5");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const availableCustomers = useMemo(() => {
    const activeIds = new Set(activeSessions.map((s) => s.customerId));
    return customers
      .filter((c) => !activeIds.has(c.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, activeSessions]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!customerId) {
      setError("Select a customer profile to start.");
      return;
    }
    setStarting(true);
    try {
      await startSession({ customerId, gameType });
      setCustomerId("");
      setGameType("ps5");
      setSuccess("Session started. Manage it from Active sessions.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start session.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1rem", maxWidth: 760 }}>
      <div>
        <h1 className="font-display" style={{ margin: 0, fontSize: "1.7rem" }}>
          Start session
        </h1>
        <p className="g-muted" style={{ marginTop: "0.35rem", fontSize: "0.92rem" }}>
          Pick a customer and station to begin. Timer and food orders are handled on{" "}
          <Link href="/active-sessions" style={{ color: "#34d399", textDecoration: "none" }}>
            Active sessions
          </Link>
          .
        </p>
      </div>

      {!customers.length ? (
        <div className="g-card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <p className="g-muted" style={{ margin: 0 }}>
            No customer profiles yet.{" "}
            <Link href="/customers" style={{ color: "#34d399", textDecoration: "none" }}>
              Create a profile
            </Link>{" "}
            before starting a session.
          </p>
        </div>
      ) : (
        <form onSubmit={handleStart} className="g-card" style={{ display: "grid", gap: "0.95rem" }}>
          <Field label="Customer profile">
            <CustomerSelectDropdown
              customers={availableCustomers}
              selectedId={customerId}
              onSelect={setCustomerId}
              disabled={availableCustomers.length === 0}
              placeholder={
                availableCustomers.length === 0
                  ? "All customers have active sessions"
                  : "Select customer…"
              }
              emptyMessage={
                availableCustomers.length === 0
                  ? "All customers currently have active sessions."
                  : "No customers match your search."
              }
            />
          </Field>

          <Field label="Game station">
            <select
              className={inputClass}
              value={gameType}
              onChange={(e) => setGameType(e.target.value as GameType)}
            >
              {GAMES.map((g) => (
                <option key={g} value={g}>
                  {GAME_LABELS[g]}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <button
              type="submit"
              className="g-btn-primary"
              style={{ cursor: "pointer" }}
              disabled={starting || !availableCustomers.length || !customerId}
            >
              {starting ? "Starting…" : "Start session"}
            </button>
          </div>
        </form>
      )}

      {success ? (
        <p style={{ margin: 0, borderRadius: 12, border: "1px solid #14532d", background: "#052e16", color: "#bbf7d0", padding: "0.7rem 0.85rem", fontSize: "0.9rem" }}>
          {success}{" "}
          <Link href="/active-sessions" style={{ color: "#86efac", fontWeight: 600 }}>
            Go to Active sessions →
          </Link>
        </p>
      ) : null}
      {error ? (
        <p style={{ margin: 0, borderRadius: 12, border: "1px solid #7f1d1d", background: "#450a0a", color: "#fecaca", padding: "0.7rem 0.85rem", fontSize: "0.9rem" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="g-form-label">{label}</span>
      {children}
    </label>
  );
}
