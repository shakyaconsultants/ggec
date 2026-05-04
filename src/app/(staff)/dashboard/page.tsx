"use client";

import { useMemo } from "react";
import { useApp } from "@/components/providers/app-providers";
import {
  mostPlayedGame,
  peakDaysOfWeek,
  peakHours,
  topCustomerByRevenue,
  topLocalityByRevenue,
  totalRevenue,
} from "@/lib/analytics";
import { GAME_LABELS } from "@/lib/pricing";

function formatHour(h: number): string {
  const am = h < 12;
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:00 ${am ? "AM" : "PM"}`;
}

export default function DashboardPage() {
  const { bills } = useApp();

  const stats = useMemo(() => {
    const played = mostPlayedGame(bills);
    const hours = peakHours(bills);
    const days = peakDaysOfWeek(bills);
    const customer = topCustomerByRevenue(bills);
    const locality = topLocalityByRevenue(bills);
    const revenue = totalRevenue(bills);
    const maxHourCount = hours[0]?.count ?? 0;
    const maxDayCount = days[0]?.count ?? 0;
    return { played, hours, days, customer, locality, revenue, maxHourCount, maxDayCount };
  }, [bills]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div>
        <h1 className="font-display" style={{ margin: 0, fontSize: "1.7rem" }}>Dashboard</h1>
        <p className="g-muted" style={{ marginTop: "0.35rem", fontSize: "0.92rem" }}>
          Insights from saved bills on this device. Add bills from{" "}
          <span style={{ color: "#f4f4f5" }}>Create bill</span>.
        </p>
      </div>

      {!bills.length ? (
        <div className="g-card" style={{ padding: "2rem", textAlign: "center", color: "#a1a1aa" }}>
          No bills yet. Create one to see stats here.
        </div>
      ) : (
        <>
          <section className="g-kpi-grid">
            <StatCard
              title="Total revenue"
              value={`Rs ${stats.revenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
              hint={`${bills.length} bill${bills.length === 1 ? "" : "s"}`}
            />
            <StatCard
              title="Most played"
              value={
                stats.played
                  ? GAME_LABELS[stats.played.game]
                  : "—"
              }
              hint={stats.played ? `${stats.played.count} sessions` : ""}
            />
            <StatCard
              title="Top customer (revenue)"
              value={stats.customer?.name ?? "—"}
              hint={
                stats.customer
                  ? `Rs ${stats.customer.revenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })} | ${stats.customer.phone}`
                  : ""
              }
            />
            <StatCard
              title="Top locality (revenue)"
              value={stats.locality?.locality ?? "—"}
              hint={
                stats.locality
                  ? `Rs ${stats.locality.revenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                  : ""
              }
            />
          </section>

          <section className="g-grid-2">
            <div className="g-card">
              <h2 style={{ margin: 0, fontSize: "0.95rem", color: "#d4d4d8" }}>Peak hours</h2>
              <p className="g-muted" style={{ margin: "0.15rem 0 0", fontSize: "0.78rem" }}>Bills grouped by start time (hour of day)</p>
              <ul className="g-list" style={{ marginTop: "0.9rem", display: "grid", gap: "0.5rem" }}>
                {stats.hours.slice(0, 8).map((row) => (
                  <li key={row.hour} style={{ display: "flex", alignItems: "center", gap: "0.55rem", fontSize: "0.85rem" }}>
                    <span style={{ width: 84, color: "#a1a1aa" }}>{formatHour(row.hour)}</span>
                    <div style={{ height: 8, flex: 1, overflow: "hidden", borderRadius: 999, background: "#27272a" }}>
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 999,
                          background: "#10b981",
                          width: `${stats.maxDayCount ? (row.count / stats.maxDayCount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span style={{ width: 28, textAlign: "right", color: "#e4e4e7" }}>{row.count}</span>
                  </li>
                ))}
              </ul>
              {stats.hours.length === 0 && (
                <p className="g-muted" style={{ marginTop: "0.7rem", fontSize: "0.84rem" }}>No hourly data.</p>
              )}
            </div>

            <div className="g-card">
              <h2 style={{ margin: 0, fontSize: "0.95rem", color: "#d4d4d8" }}>Peak days</h2>
              <p className="g-muted" style={{ margin: "0.15rem 0 0", fontSize: "0.78rem" }}>Bills by weekday</p>
              <ul className="g-list" style={{ marginTop: "0.9rem", display: "grid", gap: "0.5rem" }}>
                {stats.days.slice(0, 7).map((row) => (
                  <li key={row.dayIndex} style={{ display: "flex", alignItems: "center", gap: "0.55rem", fontSize: "0.85rem" }}>
                    <span style={{ width: 46, color: "#a1a1aa" }}>{row.label}</span>
                    <div style={{ height: 8, flex: 1, overflow: "hidden", borderRadius: 999, background: "#27272a" }}>
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 999,
                          background: "#8b5cf6",
                          width: `${stats.maxHourCount ? (row.count / stats.maxHourCount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span style={{ width: 28, textAlign: "right", color: "#e4e4e7" }}>{row.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="g-card" style={{ padding: "0.95rem" }}>
      <p style={{ margin: 0, fontSize: "0.74rem", fontWeight: 600, textTransform: "uppercase", color: "#a1a1aa", letterSpacing: "0.06em" }}>{title}</p>
      <p style={{ margin: "0.4rem 0 0", fontSize: "1.08rem", fontWeight: 700, color: "#fafafa" }}>{value}</p>
      {hint ? <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: "#a1a1aa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={hint}>{hint}</p> : null}
    </div>
  );
}
