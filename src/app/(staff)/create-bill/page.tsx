"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/app-providers";
import type { GameType } from "@/lib/types";
import { computeAmount, GAME_LABELS, ratePerHour } from "@/lib/pricing";

const inputClass = "g-input";

const GAMES: GameType[] = ["ps2", "ps3", "ps4", "ps5", "system"];

export default function CreateBillPage() {
  const router = useRouter();
  const { addBill } = useApp();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [locality, setLocality] = useState("");
  const [gameType, setGameType] = useState<GameType>("ps5");
  const [durationHours, setDurationHours] = useState("1");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hoursNum = useMemo(() => {
    const n = parseFloat(durationHours.replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [durationHours]);

  const previewAmount = useMemo(
    () => computeAmount(gameType, hoursNum),
    [gameType, hoursNum]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!customerName.trim() || !phone.trim()) return;
    try {
      const bill = await addBill({
        customerName,
        phone,
        locality,
        gameType,
        durationHours: hoursNum,
      });
      setSubmitted(
        `Bill saved: ${GAME_LABELS[gameType]}, ${hoursNum} hr -> Rs ${bill.amount.toFixed(2)}`
      );
      setCustomerName("");
      setPhone("");
      setLocality("");
      setDurationHours("1");
      setGameType("ps5");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save bill in MongoDB.";
      setError(message);
    }
  }

  return (
    <div style={{ width: "min(760px, 100%)", display: "grid", gap: "1rem" }}>
      <div>
        <h1 className="font-display" style={{ margin: 0, fontSize: "1.7rem" }}>Create bill</h1>
        <p className="g-muted" style={{ marginTop: "0.35rem", fontSize: "0.92rem" }}>
          Rates: PS2 Rs 100/hr, then +Rs 50 per generation up to PS5. PC/System Rs 150/hr.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="g-card"
        style={{ display: "grid", gap: "0.95rem" }}
      >
        <div className="g-grid-2">
          <Field label="Customer name">
            <input
              required
              className={inputClass}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
            />
          </Field>
          <Field label="Phone number">
            <input
              required
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 …"
              inputMode="tel"
              autoComplete="tel"
            />
          </Field>
        </div>

        <Field label="Locality / area">
          <input
            className={inputClass}
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder="Neighborhood"
          />
        </Field>

        <Field label="Game / station">
          <select
            className={inputClass}
            value={gameType}
            onChange={(e) => setGameType(e.target.value as GameType)}
          >
            {GAMES.map((g) => (
              <option key={g} value={g}>
                {GAME_LABELS[g]} - Rs {ratePerHour(g)}/hr
              </option>
            ))}
          </select>
        </Field>

        <Field label="Duration (hours)">
          <input
            required
            min={0}
            step="0.25"
            type="number"
            className={inputClass}
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
          />
        </Field>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", justifyContent: "space-between", gap: "0.75rem", borderRadius: 12, background: "#09090bcc", padding: "0.85rem" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "#a1a1aa", letterSpacing: "0.06em" }}>Amount due</p>
            <p style={{ margin: "0.2rem 0 0", fontSize: "1.5rem", fontWeight: 700, color: "#34d399" }}>
              Rs {previewAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <button
            type="submit"
            className="g-btn-primary"
            style={{ cursor: "pointer" }}
          >
            Save bill
          </button>
        </div>
      </form>

      {submitted ? (
        <p style={{ margin: 0, borderRadius: 12, border: "1px solid #14532d", background: "#052e16", color: "#bbf7d0", padding: "0.7rem 0.85rem", fontSize: "0.9rem" }}>
          {submitted}
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="g-form-label">{label}</span>
      {children}
    </label>
  );
}
