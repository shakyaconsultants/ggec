"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Bill, FoodItem } from "@/lib/types";
import { CustomerSearchInput } from "@/components/staff/customer-search";
import { FoodMultiSelectDropdown } from "@/components/staff/food-multi-select";
import { SessionTimer } from "@/components/staff/session-timer";
import { sessionMatchesCustomerName } from "@/lib/customer-search";
import { formatFoodPrice, lineTotal } from "@/lib/food";
import { GAME_LABELS } from "@/lib/pricing";

type ActiveSessionsPanelProps = {
  sessions: Bill[];
  menuItems: FoodItem[];
  onAddFood: (billId: string, foodIds: string[]) => Promise<void>;
  onEnd: (billId: string) => void;
  endingId?: string | null;
  addingFoodBillId?: string | null;
};

export function ActiveSessionsPanel({
  sessions,
  menuItems,
  onAddFood,
  onEnd,
  endingId,
  addingFoodBillId,
}: ActiveSessionsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const summary = useMemo(() => {
    const foodTotal = sessions.reduce((sum, s) => sum + s.foodTotal, 0);
    return { count: sessions.length, foodTotal };
  }, [sessions]);

  const filtered = useMemo(
    () =>
      sessions
        .filter((s) => sessionMatchesCustomerName(s.customerName, searchQuery))
        .sort((a, b) => a.customerName.localeCompare(b.customerName)),
    [sessions, searchQuery]
  );

  if (!sessions.length) {
    return (
      <div className="g-active-empty">
        <div className="g-active-empty-icon" aria-hidden>
          ◷
        </div>
        <h2>No live sessions</h2>
        <p className="g-muted">When you start a session, it will show up here with timer, food orders, and billing controls.</p>
        <Link href="/create-bill" className="g-btn-primary" style={{ marginTop: "0.5rem" }}>
          Start a session
        </Link>
      </div>
    );
  }

  return (
    <div className="g-active-page">
      <div className="g-active-toolbar">
        <div className="g-active-summary-inline">
          <span>
            <strong>{summary.count}</strong> live
          </span>
          <span className="g-active-summary-dot">·</span>
          <span>Food {formatFoodPrice(summary.foodTotal)}</span>
        </div>
        <CustomerSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by customer name…"
        />
      </div>

      {!filtered.length ? (
        <div className="g-card g-active-no-match">
          No sessions match &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <>
          {searchQuery ? (
            <p className="g-muted g-active-filter-count">
              Showing {filtered.length} of {sessions.length}
            </p>
          ) : null}
          <div className="g-active-grid">
            {filtered.map((session) => (
              <ActiveSessionCard
                key={session.id}
                session={session}
                menuItems={menuItems}
                onAddFood={onAddFood}
                onEnd={onEnd}
                ending={endingId === session.id}
                addingFood={addingFoodBillId === session.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ActiveSessionCard({
  session,
  menuItems,
  onAddFood,
  onEnd,
  ending,
  addingFood,
}: {
  session: Bill;
  menuItems: FoodItem[];
  onAddFood: (billId: string, foodIds: string[]) => Promise<void>;
  onEnd: (billId: string) => void;
  ending: boolean;
  addingFood: boolean;
}) {
  const [foodError, setFoodError] = useState<string | null>(null);

  const initials = session.customerName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  async function handleAddFood(foodIds: string[]) {
    setFoodError(null);
    try {
      await onAddFood(session.id, foodIds);
    } catch (err) {
      setFoodError(err instanceof Error ? err.message : "Unable to add food.");
      throw err;
    }
  }

  return (
    <article className="g-live-card g-live-card-compact">
      <div className="g-live-compact-top">
        <div className="g-live-avatar g-live-avatar-sm">{initials || "?"}</div>
        <div className="g-live-compact-main">
          <div className="g-live-compact-head">
            <p className="g-live-card-name">{session.customerName}</p>
            <span className="g-live-station-tag">{GAME_LABELS[session.gameType]}</span>
          </div>
          <p className="g-muted g-live-card-sub">
            Food {formatFoodPrice(session.foodTotal)}
            {session.foodItems.length ? ` · ${session.foodItems.length} item${session.foodItems.length === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <div className="g-live-compact-timer font-display">
          <SessionTimer startedAt={session.startedAt} />
        </div>
        <button
          type="button"
          className="g-btn-primary g-live-end-btn-sm"
          disabled={ending}
          onClick={() => onEnd(session.id)}
        >
          {ending ? "…" : "End"}
        </button>
      </div>

      {session.foodItems.length > 0 ? (
        <ul className="g-live-food-items g-live-food-items-compact">
          {session.foodItems.map((line) => (
            <li key={line.foodId} className="g-live-food-chip">
              <span>{line.name}</span>
              <span className="g-live-food-chip-qty">×{line.quantity}</span>
              <span className="g-live-food-chip-price">{formatFoodPrice(lineTotal(line))}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="g-live-compact-actions g-live-food-dropdown-wrap">
        {!menuItems.length ? (
          <p className="g-muted g-live-compact-menu-hint">
            <Link href="/food">Add food menu</Link>
          </p>
        ) : (
          <FoodMultiSelectDropdown
            items={menuItems}
            disabled={addingFood}
            ariaLabel={`Add food for ${session.customerName}`}
            onAdd={handleAddFood}
          />
        )}
      </div>
      {foodError ? <p className="g-live-error">{foodError}</p> : null}
    </article>
  );
}
