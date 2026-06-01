"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/app-providers";
import { CustomerSelectDropdown } from "@/components/staff/customer-search";
import { formatCatalogPrice, EXTRAS_SECTION_LABEL } from "@/lib/catalog";

const inputClass = "g-input";

export default function CreateBillPage() {
  const { customers, activeSessions, startSession, addCustomer, gamingStations, techServices } =
    useApp();
  const [customerId, setCustomerId] = useState("");
  const [stationId, setStationId] = useState("");
  const [extraSpecs, setExtraSpecs] = useState("");
  const [techItemIds, setTechItemIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const activeCustomerIds = useMemo(
    () => activeSessions.map((s) => s.customerId),
    [activeSessions]
  );

  const selectedStation = useMemo(
    () => gamingStations.find((s) => s.id === stationId),
    [gamingStations, stationId]
  );

  const techPreviewTotal = useMemo(() => {
    return techServices
      .filter((item) => techItemIds.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  }, [techServices, techItemIds]);

  useEffect(() => {
    if (stationId && !gamingStations.some((s) => s.id === stationId)) {
      setStationId("");
    }
    if (!stationId && gamingStations.length === 1) {
      setStationId(gamingStations[0].id);
    }
  }, [gamingStations, stationId]);

  const handleCreateCustomer = async (input: Parameters<typeof addCustomer>[0]) => {
    const customer = await addCustomer(input);
    setCustomerId(customer.id);
    return customer;
  };

  function toggleTechItem(id: string) {
    setTechItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!customerId) {
      setError("Select a customer profile to start.");
      return;
    }
    if (!stationId) {
      setError("Select a gaming station.");
      return;
    }
    setStarting(true);
    try {
      await startSession({
        customerId,
        stationId,
        extraSpecs,
        techItemIds,
      });
      setCustomerId("");
      setStationId(gamingStations.length === 1 ? gamingStations[0].id : "");
      setExtraSpecs("");
      setTechItemIds([]);
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
          Pick a customer, gaming station, optional extra items, and any session notes. Timer and food
          orders are handled on{" "}
          <Link href="/active-sessions" style={{ color: "#34d399", textDecoration: "none" }}>
            Active sessions
          </Link>
          .
        </p>
      </div>

      <form onSubmit={handleStart} className="g-card" style={{ display: "grid", gap: "0.95rem" }}>
        <Field label="Customer profile">
          <CustomerSelectDropdown
            customers={customers}
            excludeCustomerIds={activeCustomerIds}
            selectedId={customerId}
            onSelect={setCustomerId}
            onCreateCustomer={handleCreateCustomer}
            disabled={customers.length > 0 && activeCustomerIds.length === customers.length}
            placeholder={
              customers.length > 0 && activeCustomerIds.length === customers.length
                ? "All customers have active sessions"
                : "Search or create customer…"
            }
            emptyMessage="No customers match your search."
          />
        </Field>

        <Field label="Gaming station">
          {!gamingStations.length ? (
            <div className="g-card" style={{ padding: "0.85rem", background: "#111115" }}>
              <p className="g-muted" style={{ margin: 0, fontSize: "0.88rem" }}>
                No gaming stations in catalog.{" "}
                <Link href="/stations" style={{ color: "#34d399", textDecoration: "none" }}>
                  Add stations
                </Link>{" "}
                first.
              </p>
            </div>
          ) : (
            <select
              required
              className={inputClass}
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
            >
              <option value="">Select gaming station…</option>
              {gamingStations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                  {station.specs ? ` — ${station.specs}` : ""}
                </option>
              ))}
            </select>
          )}
          {selectedStation?.specs ? (
            <p className="g-muted" style={{ margin: "0.45rem 0 0", fontSize: "0.82rem" }}>
              Default specs: {selectedStation.specs}
            </p>
          ) : null}
        </Field>

        <Field label="Extra specs / notes (optional)">
          <textarea
            className={`${inputClass} g-textarea`}
            rows={3}
            value={extraSpecs}
            onChange={(e) => setExtraSpecs(e.target.value)}
            placeholder="Session-specific notes, accessories, special setup…"
          />
        </Field>

        <Field label={`${EXTRAS_SECTION_LABEL} (optional)`}>
          {!techServices.length ? (
            <p className="g-muted" style={{ margin: 0, fontSize: "0.88rem" }}>
              No extra items yet.{" "}
              <Link href="/stations" style={{ color: "#34d399", textDecoration: "none" }}>
                Add extras
              </Link>{" "}
              in the catalog (monitors, controllers, etc.).
            </p>
          ) : (
            <div className="g-tech-service-picker">
              {techServices.map((item) => {
                const checked = techItemIds.includes(item.id);
                return (
                  <label key={item.id} className={`g-tech-service-option${checked ? " is-selected" : ""}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTechItem(item.id)}
                    />
                    <span className="g-tech-service-option-main">
                      <span className="g-tech-service-option-name">{item.name}</span>
                      {item.specs ? (
                        <span className="g-tech-service-option-specs">{item.specs}</span>
                      ) : null}
                    </span>
                    <span className="g-tech-service-option-price">{formatCatalogPrice(item.price)}</span>
                  </label>
                );
              })}
              {techPreviewTotal > 0 ? (
                <p className="g-muted" style={{ margin: "0.35rem 0 0", fontSize: "0.82rem" }}>
                  Extras total: {formatCatalogPrice(techPreviewTotal)}
                </p>
              ) : null}
            </div>
          )}
        </Field>

        <div>
          <button
            type="submit"
            className="g-btn-primary"
            style={{ cursor: "pointer" }}
            disabled={starting || !customerId || !stationId}
          >
            {starting ? "Starting…" : "Start session"}
          </button>
        </div>
      </form>

      {success ? (
        <p
          style={{
            margin: 0,
            borderRadius: 12,
            border: "1px solid #14532d",
            background: "#052e16",
            color: "#bbf7d0",
            padding: "0.7rem 0.85rem",
            fontSize: "0.9rem",
          }}
        >
          {success}{" "}
          <Link href="/active-sessions" style={{ color: "#86efac", fontWeight: 600 }}>
            Go to Active sessions →
          </Link>
        </p>
      ) : null}
      {error ? (
        <p
          style={{
            margin: 0,
            borderRadius: 12,
            border: "1px solid #7f1d1d",
            background: "#450a0a",
            color: "#fecaca",
            padding: "0.7rem 0.85rem",
            fontSize: "0.9rem",
          }}
        >
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
