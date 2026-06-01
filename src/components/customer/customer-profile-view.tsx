"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { InvoiceListItem, InvoiceModal } from "@/components/staff/session-invoice";
import { PasswordChangeForm } from "@/components/customer/password-change-form";
import {
  computeCustomerProfileStats,
  completedBillsForCustomer,
} from "@/lib/customer-analytics";
import { formatDate, formatMoney } from "@/lib/invoice";
import { formatDuration } from "@/lib/pricing";
import type { Bill, Customer } from "@/lib/types";

type CustomerProfileViewProps = {
  customer: Customer;
  bills: Bill[];
  backLink?: { href: string; label: string };
  showDelete?: boolean;
  onDelete?: () => Promise<void>;
  showPasswordForm?: boolean;
  passwordEmail?: string;
};

export function CustomerProfileView({
  customer,
  bills,
  backLink,
  showDelete,
  onDelete,
  showPasswordForm,
  passwordEmail,
}: CustomerProfileViewProps) {
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const customerBills = useMemo(
    () => completedBillsForCustomer(bills, customer.id).sort((a, b) => (b.endedAt ?? "").localeCompare(a.endedAt ?? "")),
    [bills, customer.id]
  );
  const stats = useMemo(() => computeCustomerProfileStats(bills, customer.id), [bills, customer.id]);

  const initials = customer.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const maxStationCount = stats.sessionsByStation[0]?.count ?? 0;
  const maxDayCount = Math.max(...stats.recentActivity.map((d) => d.count), 0);

  async function handleDeleteProfile() {
    if (!onDelete) return;
    if (
      !window.confirm(
        `Delete profile for "${customer.name}"? All session history and invoices will be removed.`
      )
    ) {
      return;
    }
    setDeleteError(null);
    setDeleting(true);
    try {
      await onDelete();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Unable to delete profile.");
      setDeleting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {backLink ? (
        <Link href={backLink.href} className="g-back-link">
          {backLink.label}
        </Link>
      ) : null}

      <section className="g-profile-hero">
        <div className="g-profile-avatar">{initials || "?"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="g-eyebrow" style={{ margin: 0 }}>Player profile</p>
          <h1 className="font-display" style={{ margin: "0.35rem 0 0", fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
            {customer.name}
          </h1>
          <p className="g-muted" style={{ margin: "0.4rem 0 0", fontSize: "0.92rem" }}>
            {customer.email ? `${customer.email} · ` : ""}
            {customer.phone}
            {customer.locality ? ` · ${customer.locality}` : ""}
          </p>
          <p className="g-muted" style={{ margin: "0.35rem 0 0", fontSize: "0.82rem" }}>
            Member since {formatDate(customer.createdAt)}
            {stats.lastSessionAt ? ` · Last visit ${formatDate(stats.lastSessionAt)}` : ""}
          </p>
        </div>
        {stats.favoriteStation ? (
          <div className="g-profile-badge">
            <span className="g-muted" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Main station
            </span>
            <span style={{ display: "block", marginTop: "0.2rem", fontWeight: 700, color: "#34d399" }}>
              {stats.favoriteStation.station}
            </span>
            <span className="g-muted" style={{ fontSize: "0.78rem" }}>
              {stats.favoriteStation.count} sessions
            </span>
          </div>
        ) : null}
        {showDelete && onDelete ? (
          <button type="button" className="g-btn-danger" disabled={deleting} onClick={handleDeleteProfile}>
            {deleting ? "Deleting…" : "Delete profile"}
          </button>
        ) : null}
      </section>

      {deleteError ? <p className="g-alert g-alert-error">{deleteError}</p> : null}

      <section className="g-kpi-grid">
        <ProfileStat label="Total sessions" value={String(stats.totalSessions)} />
        <ProfileStat label="Hours played" value={formatDuration(stats.totalHours)} />
        <ProfileStat label="Total spent" value={formatMoney(stats.totalSpent)} />
        <ProfileStat
          label="Avg session"
          value={stats.totalSessions ? formatDuration(stats.averageSessionHours) : "—"}
          hint={stats.totalSessions ? `${formatMoney(stats.averageSpend)} avg` : undefined}
        />
      </section>

      {stats.totalSessions > 0 ? (
        <section className="g-grid-2">
          <div className="g-card">
            <h2 style={{ margin: 0, fontSize: "0.95rem", color: "#d4d4d8" }}>Sessions by station</h2>
            <ul style={{ margin: "0.85rem 0 0", padding: 0, listStyle: "none", display: "grid", gap: "0.55rem" }}>
              {stats.sessionsByStation.map((row) => (
                <li key={row.station} style={{ display: "flex", alignItems: "center", gap: "0.55rem", fontSize: "0.85rem" }}>
                  <span style={{ width: 110, color: "#e4e4e7" }}>{row.station}</span>
                  <div style={{ height: 8, flex: 1, overflow: "hidden", borderRadius: 999, background: "#27272a" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 999,
                        background: "#34d399",
                        width: `${maxStationCount ? (row.count / maxStationCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span style={{ width: 72, textAlign: "right", color: "#a1a1aa", fontSize: "0.78rem" }}>
                    {row.count} · {formatDuration(row.hours)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="g-card">
            <h2 style={{ margin: 0, fontSize: "0.95rem", color: "#d4d4d8" }}>Activity by weekday</h2>
            <ul style={{ margin: "0.85rem 0 0", padding: 0, listStyle: "none", display: "grid", gap: "0.55rem" }}>
              {stats.recentActivity.map((row) => (
                <li key={row.dayIndex} style={{ display: "flex", alignItems: "center", gap: "0.55rem", fontSize: "0.85rem" }}>
                  <span style={{ width: 40, color: "#a1a1aa" }}>{row.label}</span>
                  <div style={{ height: 8, flex: 1, overflow: "hidden", borderRadius: 999, background: "#27272a" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 999,
                        background: "#8b5cf6",
                        width: `${maxDayCount ? (row.count / maxDayCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span style={{ width: 28, textAlign: "right", color: "#e4e4e7" }}>{row.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem", color: "#e4e4e7" }}>
          Invoice history ({customerBills.length})
        </h2>
        {!customerBills.length ? (
          <div className="g-card" style={{ padding: "1.5rem", textAlign: "center", color: "#a1a1aa" }}>
            No completed sessions yet. Invoices appear here after sessions end.
          </div>
        ) : (
          <div className="g-card g-invoice-history-wrap" style={{ padding: 0, overflow: "hidden" }}>
            <table className="g-invoice-history">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Station</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {customerBills.map((bill) => (
                  <InvoiceListItem key={bill.id} bill={bill} onView={setViewBill} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showPasswordForm && passwordEmail ? <PasswordChangeForm email={passwordEmail} /> : null}

      {viewBill ? <InvoiceModal bill={viewBill} onClose={() => setViewBill(null)} /> : null}
    </div>
  );
}

function ProfileStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="g-card g-profile-stat">
      <p className="g-profile-stat-label">{label}</p>
      <p className="g-profile-stat-value">{value}</p>
      {hint ? <p className="g-muted" style={{ margin: "0.2rem 0 0", fontSize: "0.76rem" }}>{hint}</p> : null}
    </div>
  );
}
