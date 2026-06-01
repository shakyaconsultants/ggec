"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/app-providers";
import {
  CATALOG_KIND_LABELS,
  EXTRAS_SECTION_HINT,
  EXTRAS_SECTION_LABEL,
  formatCatalogPrice,
} from "@/lib/catalog";
import type { CatalogItem, CatalogItemKind } from "@/lib/types";

const inputClass = "g-input";

export default function StationsPage() {
  const { catalogItems, addCatalogItem, deleteCatalogItem } = useApp();
  const [kind, setKind] = useState<CatalogItemKind>("gaming_station");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [specs, setSpecs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const gamingStations = useMemo(
    () => catalogItems.filter((item) => item.kind === "gaming_station"),
    [catalogItems]
  );
  const extraItems = useMemo(
    () => catalogItems.filter((item) => item.kind === "tech_service"),
    [catalogItems]
  );

  const isStation = kind === "gaming_station";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name.trim()) return;

    let priceNum: number | undefined;
    if (!isStation) {
      priceNum = parseFloat(price.replace(",", "."));
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        setError("Enter a valid price for this extra item.");
        return;
      }
    }

    setSaving(true);
    try {
      const item = await addCatalogItem({
        name,
        price: priceNum,
        kind,
        specs,
      });
      setSuccess(
        item.kind === "gaming_station"
          ? `Added gaming station "${item.name}".`
          : `Added extra item "${item.name}" at ${formatCatalogPrice(item.price)}.`
      );
      setName("");
      setPrice("");
      setSpecs("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add catalog item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, itemName: string) {
    if (!window.confirm(`Delete "${itemName}" from the catalog?`)) return;
    setError(null);
    setSuccess(null);
    setDeletingId(id);
    try {
      await deleteCatalogItem(id);
      setSuccess(`Removed ${itemName} from the catalog.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete catalog item.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1rem", maxWidth: 900 }}>
      <div>
        <h1 className="font-display" style={{ margin: 0, fontSize: "1.7rem" }}>
          Stations &amp; extras
        </h1>
        <p className="g-muted" style={{ marginTop: "0.35rem", fontSize: "0.92rem" }}>
          Add gaming stations for session start (billed hourly). Add extra items like monitors,
          controllers, and consoles with fixed prices.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="g-card" style={{ display: "grid", gap: "0.95rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem", color: "#e4e4e7" }}>Add to catalog</h2>
        <div className="g-grid-2">
          <Field label="Type">
            <select
              className={inputClass}
              value={kind}
              onChange={(e) => setKind(e.target.value as CatalogItemKind)}
            >
              <option value="gaming_station">{CATALOG_KIND_LABELS.gaming_station}</option>
              <option value="tech_service">{CATALOG_KIND_LABELS.tech_service}</option>
            </select>
          </Field>
          <Field label="Name">
            <input
              required
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                isStation ? "e.g. PlayStation 5, PC booth" : "e.g. Extra monitor, DualSense controller"
              }
            />
          </Field>
        </div>
        <div className={isStation ? "" : "g-grid-2"}>
          {!isStation ? (
            <Field label="Price (Rs)">
              <input
                required
                min={0.01}
                step="0.01"
                type="number"
                className={inputClass}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150"
              />
            </Field>
          ) : null}
          <Field label="Specs / description">
            <input
              className={inputClass}
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              placeholder="e.g. 4K display, dual shock included"
            />
          </Field>
        </div>
        <p className="g-muted" style={{ margin: 0, fontSize: "0.82rem" }}>
          {isStation
            ? "Gaming stations appear in Start session. Play time uses the standard hourly billing rules — no fixed price here."
            : `${EXTRAS_SECTION_HINT} Selected extras are charged at checkout.`}
        </p>
        <div>
          <button type="submit" className="g-btn-primary" style={{ cursor: "pointer" }} disabled={saving}>
            {saving ? "Adding…" : "Add to catalog"}
          </button>
        </div>
        {success ? <p className="g-alert g-alert-success">{success}</p> : null}
        {error ? <p className="g-alert g-alert-error">{error}</p> : null}
      </form>

      <CatalogSection
        title={`Gaming stations (${gamingStations.length})`}
        empty="No gaming stations yet. Add stations above — they appear when starting a session."
        items={gamingStations}
        showPrice={false}
        priceNote="Hourly session billing"
        deletingId={deletingId}
        onDelete={handleDelete}
      />

      <CatalogSection
        title={`${EXTRAS_SECTION_LABEL} (${extraItems.length})`}
        empty={`No extra items yet. Add monitors, controllers, consoles, etc. with fixed pricing.`}
        items={extraItems}
        showPrice
        deletingId={deletingId}
        onDelete={handleDelete}
      />
    </div>
  );
}

function CatalogSection({
  title,
  empty,
  items,
  showPrice,
  priceNote,
  deletingId,
  onDelete,
}: {
  title: string;
  empty: string;
  items: CatalogItem[];
  showPrice: boolean;
  priceNote?: string;
  deletingId: string | null;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <section>
      <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem", color: "#e4e4e7" }}>{title}</h2>
      {!items.length ? (
        <div className="g-card" style={{ padding: "2rem", textAlign: "center", color: "#a1a1aa" }}>
          {empty}
        </div>
      ) : (
        <div className="g-food-menu-grid">
          {items.map((item) => (
            <div key={item.id} className="g-card g-food-menu-item">
              <div className="g-list-item-top">
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#fafafa" }}>{item.name}</p>
                  {item.specs ? (
                    <p className="g-muted" style={{ margin: "0.35rem 0 0", fontSize: "0.82rem" }}>
                      {item.specs}
                    </p>
                  ) : null}
                  {showPrice ? (
                    <p style={{ margin: "0.35rem 0 0", fontSize: "1.05rem", fontWeight: 700, color: "#34d399" }}>
                      {formatCatalogPrice(item.price)}
                    </p>
                  ) : priceNote ? (
                    <p className="g-muted" style={{ margin: "0.35rem 0 0", fontSize: "0.82rem" }}>
                      {priceNote}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="g-btn-danger"
                  disabled={deletingId === item.id}
                  onClick={() => onDelete(item.id, item.name)}
                >
                  {deletingId === item.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
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
