"use client";

import { useEffect } from "react";
import type { Bill } from "@/lib/types";
import { BRAND_FULL_NAME } from "@/lib/brand";
import {
  formatDateTime,
  formatMoney,
  invoiceNumber,
  type InvoiceProps,
} from "@/lib/invoice";
import { lineTotal } from "@/lib/food";
import { printInvoice } from "@/lib/invoice-print";
import { formatDuration, GAME_LABELS, GAMING_PRICING_SUMMARY, GAMING_RATE_LABEL } from "@/lib/pricing";

export function SessionInvoice({ bill, showActions = true, onClose, compact }: InvoiceProps) {
  const foodItems = bill.foodItems ?? [];
  const canRender = bill.status === "completed" && !!bill.endedAt;

  function handlePrint() {
    printInvoice(bill.id);
  }

  if (!canRender) {
    return (
      <article className={`g-invoice${compact ? " g-invoice-compact" : ""}`}>
        <p style={{ margin: 0, color: "#52525b" }}>This invoice is unavailable or incomplete.</p>
        {showActions && onClose ? (
          <div className="g-invoice-actions g-no-print">
            <button type="button" className="g-btn-primary" style={{ cursor: "pointer" }} onClick={onClose}>
              Close
            </button>
          </div>
        ) : null}
      </article>
    );
  }

  const hasFood = foodItems.length > 0;

  return (
    <article className={`g-invoice${compact ? " g-invoice-compact" : ""}`} id={`invoice-${bill.id}`}>
      <header className="g-invoice-header">
        <div>
          <p className="g-invoice-brand font-display">{BRAND_FULL_NAME}</p>
          <p className="g-invoice-sub">Premium gaming cafe & lounge</p>
        </div>
        <div className="g-invoice-meta">
          <p className="g-invoice-label">Invoice</p>
          <p className="g-invoice-number">{invoiceNumber(bill.id)}</p>
          <p className="g-invoice-date">{formatDateTime(bill.endedAt!)}</p>
        </div>
      </header>

      <div className="g-invoice-divider" />

      <section className="g-invoice-grid">
        <div>
          <p className="g-invoice-section-title">Billed to</p>
          <p className="g-invoice-name">{bill.customerName}</p>
          <p className="g-invoice-detail">{bill.phone}</p>
          {bill.locality ? <p className="g-invoice-detail">{bill.locality}</p> : null}
        </div>
        <div>
          <p className="g-invoice-section-title">Session</p>
          <p className="g-invoice-detail">{GAME_LABELS[bill.gameType]}</p>
          <p className="g-invoice-detail">Start: {formatDateTime(bill.startedAt)}</p>
          <p className="g-invoice-detail">End: {formatDateTime(bill.endedAt!)}</p>
        </div>
      </section>

      <table className="g-invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty / Duration</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Gaming session — {GAME_LABELS[bill.gameType]}</td>
            <td>{formatDuration(bill.durationHours)}</td>
            <td>{GAMING_RATE_LABEL}</td>
            <td>{formatMoney(bill.gamingAmount)}</td>
          </tr>
          {foodItems.map((line) => (
            <tr key={line.foodId}>
              <td>{line.name}</td>
              <td>{line.quantity}</td>
              <td>{formatMoney(line.unitPrice)}</td>
              <td>{formatMoney(lineTotal(line))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {hasFood ? (
            <>
              <tr className="g-invoice-subtotal">
                <td colSpan={3}>Gaming subtotal</td>
                <td>{formatMoney(bill.gamingAmount)}</td>
              </tr>
              <tr className="g-invoice-subtotal">
                <td colSpan={3}>Food subtotal</td>
                <td>{formatMoney(bill.foodTotal)}</td>
              </tr>
            </>
          ) : null}
          <tr>
            <td colSpan={3}>Total due</td>
            <td className="g-invoice-total">{formatMoney(bill.amount)}</td>
          </tr>
        </tfoot>
      </table>

      <p className="g-invoice-footer">
        Thank you for visiting {BRAND_FULL_NAME}. {GAMING_PRICING_SUMMARY}
        {hasFood ? " · Food billed separately" : ""} · Session ID: {bill.id.slice(0, 8)}
      </p>

      {showActions ? (
        <div className="g-invoice-actions g-no-print">
          <button type="button" className="g-btn-ghost" style={{ cursor: "pointer" }} onClick={handlePrint}>
            Print / Save PDF
          </button>
          {onClose ? (
            <button type="button" className="g-btn-primary" style={{ cursor: "pointer" }} onClick={onClose}>
              Close
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function InvoiceModal({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="g-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Invoice"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="g-modal-panel">
        <div className="g-modal-toolbar g-no-print">
          <p className="g-modal-toolbar-title">Invoice</p>
          <button
            type="button"
            className="g-modal-close"
            aria-label="Close invoice"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="g-modal-body">
          <SessionInvoice bill={bill} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

export function InvoiceListItem({
  bill,
  onView,
}: {
  bill: Bill;
  onView: (bill: Bill) => void;
}) {
  if (bill.status !== "completed" || !bill.endedAt) return null;

  return (
    <tr className="g-invoice-row">
      <td>{invoiceNumber(bill.id)}</td>
      <td>{formatDateTime(bill.endedAt)}</td>
      <td>{GAME_LABELS[bill.gameType]}</td>
      <td>{formatDuration(bill.durationHours)}</td>
      <td>{formatMoney(bill.amount)}</td>
      <td>
        <button type="button" className="g-link-btn" onClick={() => onView(bill)}>
          View invoice
        </button>
      </td>
    </tr>
  );
}
