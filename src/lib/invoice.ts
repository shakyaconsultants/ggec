import type { Bill } from "./types";
import { INVOICE_PREFIX } from "./brand";

export function invoiceNumber(billId: string): string {
  const compact = billId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `${INVOICE_PREFIX}-${compact}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMoney(amount: number): string {
  return `Rs ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export type InvoiceProps = {
  bill: Bill;
  showActions?: boolean;
  onClose?: () => void;
  compact?: boolean;
};
