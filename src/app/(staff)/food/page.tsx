"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/app-providers";
import { formatFoodPrice } from "@/lib/food";

const inputClass = "g-input";

export default function FoodPage() {
  const { menuItems, addMenuItem, deleteMenuItem } = useApp();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const priceNum = parseFloat(price.replace(",", "."));
    if (!name.trim() || !Number.isFinite(priceNum)) return;
    setSaving(true);
    try {
      const item = await addMenuItem({ name, price: priceNum });
      setSuccess(`Added ${item.name} at ${formatFoodPrice(item.price)}.`);
      setName("");
      setPrice("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add food item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, itemName: string) {
    if (!window.confirm(`Delete "${itemName}" from the menu?`)) return;
    setError(null);
    setSuccess(null);
    setDeletingId(id);
    try {
      await deleteMenuItem(id);
      setSuccess(`Removed ${itemName} from the menu.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete food item.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1rem", maxWidth: 760 }}>
      <div>
        <h1 className="font-display" style={{ margin: 0, fontSize: "1.7rem" }}>
          Food menu
        </h1>
        <p className="g-muted" style={{ marginTop: "0.35rem", fontSize: "0.92rem" }}>
          Add snacks and drinks here. They appear in the food dropdown during active sessions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="g-card" style={{ display: "grid", gap: "0.95rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem", color: "#e4e4e7" }}>Add food item</h2>
        <div className="g-grid-2">
          <Field label="Item name">
            <input
              required
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cold drink, Samosa"
            />
          </Field>
          <Field label="Price (Rs)">
            <input
              required
              min={0}
              step="0.01"
              type="number"
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="50"
            />
          </Field>
        </div>
        <div>
          <button type="submit" className="g-btn-primary" style={{ cursor: "pointer" }} disabled={saving}>
            {saving ? "Adding…" : "Add to menu"}
          </button>
        </div>
        {success ? (
          <p className="g-alert g-alert-success">{success}</p>
        ) : null}
        {error ? (
          <p className="g-alert g-alert-error">{error}</p>
        ) : null}
      </form>

      <section>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem", color: "#e4e4e7" }}>
          Menu ({menuItems.length})
        </h2>
        {!menuItems.length ? (
          <div className="g-card" style={{ padding: "2rem", textAlign: "center", color: "#a1a1aa" }}>
            No food items yet. Add items above to offer them during sessions.
          </div>
        ) : (
          <div className="g-food-menu-grid">
            {menuItems.map((item) => (
              <div key={item.id} className="g-card g-food-menu-item">
                <div className="g-list-item-top">
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#fafafa" }}>{item.name}</p>
                    <p style={{ margin: "0.35rem 0 0", fontSize: "1.05rem", fontWeight: 700, color: "#34d399" }}>
                      {formatFoodPrice(item.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="g-btn-danger"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id, item.name)}
                  >
                    {deletingId === item.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
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
